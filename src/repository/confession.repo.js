const confession = require('../models/confession.model');

const saveConfession = async (message) => {
    const isExist = await confession.findOne({
        userId: process.env.USER_ID_TELE,
    });
    if (!isExist) {
        const newConfession = new confession({
            userId: process.env.USER_ID_TELE,
        });
        await newConfession.save();
    }
    const messageFormat = message.split('\n');

    if (messageFormat.length > 1) {
        const data = {
            title: messageFormat[0],
            content: messageFormat.slice(1).join('\n'),
        };
        await confession.updateOne(
            { userId: process.env.USER_ID_TELE },
            {
                $push: {
                    data: data,
                },
            },
        );
    } else {
        await confession.updateOne(
            { userId: process.env.USER_ID_TELE },
            {
                $push: {
                    data: {
                        content: messageFormat[0],
                    },
                },
            },
        );
    }
};

module.exports = { saveConfession };
