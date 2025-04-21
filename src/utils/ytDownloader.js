const { exec } = require('child_process');
const fs = require('fs');

const downloadMp3 = (url) => {
    const outputDir = './downloads';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const cmd = `yt-dlp --cookies cookies.txt -x --audio-format mp3 --print after_move:filepath -o "${outputDir}/%(title)s.%(ext)s" ${url}`;

    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(`Lỗi: ${error.message}`);
            if (stderr) console.warn(`⚠️ Cảnh báo: ${stderr}`);

            const lines = stdout.split('\n');
            const filePath = lines.find((line) => line.endsWith('.mp3'));

            if (!filePath) return reject('Không tìm thấy file đã tải về.');
            resolve(filePath.trim());
        });
    });
};

module.exports = downloadMp3;
