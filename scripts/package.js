import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releasesDir = path.join(rootDir, 'releases');

// Create releases directory if it doesn't exist
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir);
}

// Read package.json to get name and version
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const { name, version } = packageJson;

const zipFileName = `${name}-v${version}.zip`;
const outputFilePath = path.join(releasesDir, zipFileName);

// Create a file to stream archive data to.
const output = fs.createWriteStream(outputFilePath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`${zipFileName} has been created successfully.`);
  console.log(`Total bytes: ${archive.pointer()}`);
  console.log(`Path: ${outputFilePath}`);
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
    console.warn(err);
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
if (fs.existsSync(distDir)) {
    archive.directory(distDir, false);
} else {
    console.error(`Error: ${distDir} does not exist. Please run 'npm run build' first.`);
    process.exit(1);
}

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();
