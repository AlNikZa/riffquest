import mongoose from './db.js'; // tvoj db.js sa connection string

async function testDB() {
  try {
    // Sačekaj dok konekcija ne bude otvorena
    await mongoose.connection.asPromise();

    console.log('MongoDB connected ✅');

    // Ubaci test dokument u kolekciju 'testCollection'
    const doc = await mongoose.connection.db
      .collection('testCollection')
      .insertOne({ test: 'RiffQuest Test' });

    console.log('Document inserted with _id:', doc.insertedId);

    // Obriši test dokument
    await mongoose.connection.db
      .collection('testCollection')
      .deleteOne({ _id: doc.insertedId });

    console.log('MongoDB connection is working perfectly ✅');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error ❌', err);
    process.exit(1);
  }
}

testDB();
