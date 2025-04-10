const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'mwtm',
        description: 'Download subtitle from Mix with the Masters',
        options: [
            {
                name: 'code', // tên của option
                description: 'Nhập một chuỗi',
                type: 3,
                required: true, // bắt buộc phải nhập
            },
        ],
    },
    {
        name: 'sync',
        description: 'Sync data for Budget Tracker',
    },
];

module.exports = commands;
