from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `fcm_tokens` (
    `id` CHAR(36) NOT NULL  PRIMARY KEY,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `user_id_id` CHAR(36) NOT NULL UNIQUE,
    CONSTRAINT `fk_fcm_toke_users_bb780858` FOREIGN KEY (`user_id_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `fcm_tokens`;"""
