'use strict';

const auth = (ctx, next) => {
    const ownerId = process.env.USER_ID_TELE;
    const userId = ctx.message.from.id;

    if (userId.toString() === ownerId.toString()) {
        if (!ctx.session) ctx.session = {};
        ctx.session.notes = [];
        return next();
    } else {
        ctx.reply('Bạn không có quyền sử dụng bot này.');
    }
};

module.exports = auth;
