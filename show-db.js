const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('confessions.db');

db.all('SELECT * FROM confessions', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('No confessions found in the database.');
        return;
    }

    console.log('\nConfessions in database:\n');
    rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`To: ${row.to_name}`);
        console.log(`Message: ${row.message}`);
        console.log(`From: ${row.from_name}`);
        console.log(`Created at: ${row.created_at}`);
        console.log('------------------------');
    });

    db.close();
});