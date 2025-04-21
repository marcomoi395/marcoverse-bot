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
                name: 'code',
                description: 'Nhập một chuỗi',
                type: 3,
                required: true,
            },
        ],
    },
    // {
    //     name: 'mp3',
    //     description: 'Download audio from Youtube',
    //     options: [
    //         {
    //             name: 'url',
    //             description: 'Nhập url',
    //             type: 3,
    //             required: true,
    //         },
    //     ],
    // },
    {
        name: 'sync',
        description: 'Sync data for Budget Tracker',
    },
];

module.exports = commands;
