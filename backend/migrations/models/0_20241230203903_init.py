from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `services` (
    `id` CHAR(36) NOT NULL  PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `sub_name` VARCHAR(255) NOT NULL,
    `has_alert_notification` BOOL NOT NULL  DEFAULT 0,
    `has_auto_publish` BOOL NOT NULL  DEFAULT 0
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `alert_config` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `has_extra_email` BOOL   DEFAULT 0,
    `has_teams_slack` BOOL   DEFAULT 0,
    `mail_from` VARCHAR(255),
    `mail_cc` VARCHAR(255),
    `mail_to` VARCHAR(255),
    `alert_mail_title` VARCHAR(255),
    `alert_mail_body` LONGTEXT,
    `recovery_mail_title` VARCHAR(255),
    `recovery_mail_body` LONGTEXT,
    `extra_mail_to` VARCHAR(255),
    `extra_mail_body` LONGTEXT,
    `slack_link` VARCHAR(255),
    `teams_link` VARCHAR(255),
    `service_id` CHAR(36) NOT NULL UNIQUE,
    CONSTRAINT `fk_alert_co_services_e2cc0b68` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `service_logs` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `start_time` DATETIME(6),
    `end_time` DATETIME(6),
    `elapsed_time` DOUBLE,
    `is_ok` BOOL NOT NULL  DEFAULT 1,
    `screenshot` VARCHAR(255),
    `content` LONGTEXT,
    `service_id` CHAR(36) NOT NULL,
    CONSTRAINT `fk_service__services_f3fc2688` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `publish_config` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `alert_publish_title` VARCHAR(255),
    `alert_publish_body` VARCHAR(511),
    `show_influenced_user` BOOL   DEFAULT 0,
    `send_mail` BOOL   DEFAULT 0,
    `service_id` CHAR(36) NOT NULL UNIQUE,
    CONSTRAINT `fk_publish__services_ddc4beaa` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `users` (
    `id` CHAR(36) NOT NULL  PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `is_superuser` BOOL NOT NULL  DEFAULT 0,
    `is_active` BOOL NOT NULL  DEFAULT 1,
    `can_edit` BOOL   DEFAULT 0,
    `is_totp_enabled` BOOL NOT NULL  DEFAULT 0,
    `totp_secret` VARCHAR(255)
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `aerich` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `version` VARCHAR(255) NOT NULL,
    `app` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `users_services` (
    `users_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uidx_users_servi_users_i_4ccff3` (`users_id`, `service_id`)
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
