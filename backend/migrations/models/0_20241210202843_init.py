from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `services` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `sub_name` VARCHAR(255) NOT NULL UNIQUE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `service_configs` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `email_from` VARCHAR(255),
    `email_cc` VARCHAR(255),
    `email_to` VARCHAR(255),
    `alert_email_title` VARCHAR(255),
    `recovery_email_title` VARCHAR(255),
    `alert_email_body` LONGTEXT,
    `recovery_email_body` LONGTEXT,
    `slack_link` VARCHAR(255),
    `teams_link` VARCHAR(255),
    `service_id` INT NOT NULL UNIQUE,
    CONSTRAINT `fk_service__services_f5ba268d` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `service_logs` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `start_time` DATETIME(6),
    `end_time` DATETIME(6),
    `elapsed_time` DOUBLE,
    `is_ok` BOOL NOT NULL  DEFAULT 1,
    `screenshot` VARCHAR(255),
    `logs` LONGTEXT,
    `service_id` INT NOT NULL UNIQUE,
    CONSTRAINT `fk_service__services_f3fc2688` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `is_superuser` BOOL NOT NULL  DEFAULT 0,
    `is_active` BOOL NOT NULL  DEFAULT 1,
    `can_edit` BOOL   DEFAULT 0
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `aerich` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `version` VARCHAR(255) NOT NULL,
    `app` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `users_services` (
    `users_id` INT NOT NULL,
    `servicedatabase_id` INT NOT NULL,
    FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`servicedatabase_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uidx_users_servi_users_i_0949e8` (`users_id`, `servicedatabase_id`)
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
