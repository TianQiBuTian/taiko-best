import fs from 'fs';
import path from 'path';

const songsPath = path.join('dist', 'songs.json');

if (fs.existsSync(songsPath)) {
  const data = JSON.parse(fs.readFileSync(songsPath, 'utf-8'));
  fs.writeFileSync(songsPath, JSON.stringify(data));
  console.log('songs.json has been minified successfully!');
} else {
  console.log('songs.json not found in dist folder.');
}
