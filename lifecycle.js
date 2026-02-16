// lifecycle.js

let isShuttingDown = false; // Guard flag to prevent multiple shutdown triggers.
const cleanupTasks = [];

const getShutdownReason = (signal) => {
	switch (signal) {
		case 'SIGUSR2':
			return '🔁 Restart triggered by Nodemon';
		case 'SIGINT':
			return '⛔ Manual interruption (Ctrl+C)';
		case 'SIGTERM':
			return '☁️ Termination signal from hosting environment';
		case 'UNHANDLED REJECTION':
			return '🔥 Unhandled Promise Rejection';
		case 'UNCAUGHT EXCEPTION':
			return '💥 Uncaught Exception';
		default:
			return `⚠️ Unknown shutdown signal (${signal})`;
	}
};

const logShutdownStatus = (signal, err, taskCount, ...taskNames) => {
	const reason = getShutdownReason(signal);

	console.log(`\n--- 🛑 GRACEFUL SHUTDOWN START ---`);
	console.log(`📡 Signal: ${signal}`);
	console.log(`📌 Reason: ${reason}`);

	if (err) {
		console.error(`🔥 Triggered by error: ${err.message || err}`);
	}

	console.log(
		`🧹 Cleaning up ${taskCount} registered resources: ` + [...taskNames],
	);
};

// Logic for a clean exit. Executes registered tasks (DB close, Server stop) before the process officially terminates.
const gracefulShutdown = async (signal, err) => {
	if (isShuttingDown) return;
	isShuttingDown = true;

	logShutdownStatus(
		signal,
		err,
		cleanupTasks.length,
		cleanupTasks.map((t) => t.name).join(', '),
	);

	// Set a timeout to forcefully exit if shutdown takes too long
	const forceExit = setTimeout(() => {
		console.error('⌛  Forcefully shutting down due to cleanup timeout');
		process.exit(1);
	}, 1000 * 10);

	try {
		// Execute tasks in reverse order of registration (LIFO)
		for (const { name, task } of [...cleanupTasks].reverse()) {
			console.log(`🔻 Closing: ${name}...`);
			await task();
		}

		const isRestart = signal === 'SIGUSR2';
		if (isRestart) {
			console.log('🔁 Application restarting...');
		} else {
			console.log('✨ Shutdown complete. Goodbye! 👋');
		}
		process.exit(0);
	} catch (shutdownErr) {
		console.error('💥 Error during graceful shutdown:', shutdownErr);
		process.exit(1);
	} finally {
		// Cancel the emergency timeout to allow the process to exit immediately after successful cleanup.
		clearTimeout(forceExit);
	}
};

// Registers a callback function to be executed during the shutdown sequence.
export const registerCleanupTask = (name, task) => {
	cleanupTasks.push({ name, task });
};

// Sets up listeners for system signals and unhandled process-level errors.
export const registerShutdownHandlers = () => {
	// Capture unhandled promise rejections (e.g., failed async calls without .catch)
	process.on('unhandledRejection', (err) =>
		gracefulShutdown('UNHANDLED REJECTION', err),
	);

	// Capture synchronous exceptions that were not caught within try/catch blocks
	process.on('uncaughtException', (err) =>
		gracefulShutdown('UNCAUGHT EXCEPTION', err),
	);

	// Listen for termination signals
	process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Cloud environments (e.g., Render, Docker)
	process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Manual interruption (Ctrl+C)
	process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal
};
