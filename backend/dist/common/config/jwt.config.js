"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtConfig = void 0;
const getJwtConfig = (configService) => {
    return {
        secret: configService.getOrThrow('JWT_ACCESS_SECRET'),
        signOptions: {
            expiresIn: configService.getOrThrow('JWT_ACCESS_EXPIRATION'),
        },
    };
};
exports.getJwtConfig = getJwtConfig;
//# sourceMappingURL=jwt.config.js.map