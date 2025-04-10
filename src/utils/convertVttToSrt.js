const convertVttToSrt = (vtt) => {
    const lines = vtt.trim().split('\n');
    const srtLines = [];
    let counter = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Bỏ qua dòng metadata
        if (line === 'WEBVTT' || line === '') continue;

        // Kiểm tra dòng thời gian
        if (line.includes('-->')) {
            const startTime = line.split('-->')[0].trim().replace('.', ',');
            const endTime = line.split('-->')[1].trim().replace('.', ',');
            const textLines = [];

            // Lấy text subtitle ở các dòng kế tiếp
            while (lines[i + 1] && lines[i + 1].trim() !== '') {
                textLines.push(lines[++i].trim());
            }

            srtLines.push(`${counter++}`);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(...textLines, '');
        }
    }

    return srtLines.join('\n');
};

module.exports = convertVttToSrt;
