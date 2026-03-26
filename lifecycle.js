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
		const errorDetail = err.errorCode
			? `[${err.errorCode}] ${err.message || 'unknown.'}`
			: err.message || err;
		console.error(`🔥 Triggered by error: ${errorDetail}`);

		if (err.stack) {
			console.error('--- 📋 STACK TRACE ---');
			console.error(err.stack);
			console.error('----------------------');
		}
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

// Only used in development to prevent EADDRINUSE errors during Nodemon restarts.
export const freePortBeforeServerStart = async (port) => {
	try {
		// Dynamic import to avoid loading development dependencies in production
		const kill = (await import('kill-port')).default;
		await kill(port);
		console.log(`✅ Port ${port} was busy and has been freed.`);
	} catch (err) {
		// We ignore errors indicating the port is already free or no process was found
		const isAlreadyFree =
			err.message.includes('not found') ||
			err.message.includes('No process running on port') ||
			err.code === 'ESRCH'; // Error: No such process
		if (isAlreadyFree) {
			console.log(`✅ Port ${port} is free and ready for listening.`);
		} else {
			// We log other errors as warnings, but don't stop the process
			// because the server might still manage to bind to the port.
			console.error(`⚠️ Could not free port ${port}:`, err.message);
		}
	}
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
