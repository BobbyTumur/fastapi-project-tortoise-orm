from tortoise import fields
from tortoise.models import Model

class User(Model):
    id = fields.UUIDField(primary_key=True)
    username = fields.CharField(max_length=255, unique=True)
    email = fields.CharField(max_length=255, unique=True)
    hashed_password = fields.CharField(max_length=255)
    is_superuser = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)
    can_edit = fields.BooleanField(default=False, null=True)
    is_totp_enabled = fields.BooleanField(default=False)
    totp_secret = fields.CharField(max_length=255, null=True)
    services = fields.ManyToManyField('models.Service', related_name="users")

    class Meta:
        table = "users"
    
    async def save(self, *args, **kwargs):
        # Automatically set can_edit to True if is_superuser is True
        if self.is_superuser:
            self.can_edit = True
        await super().save(*args, **kwargs)

class Service(Model):
    id = fields.UUIDField(primary_key=True)  # Primary key, auto-incremented
    name = fields.CharField(max_length=255)  # required
    sub_name = fields.CharField(max_length=255)  # required
    has_alert_notification = fields.BooleanField(default=False)
    has_auto_publish = fields.BooleanField(default=False)
    alert_config: fields.OneToOneRelation["AlertConfig"]
    publish_config: fields.OneToOneRelation["PublishConfig"]
    log: fields.ReverseRelation["Log"]
    class Meta:
        table = "services"  # Explicitly set the table name
        unique_together = (("name", "sub_name"),)

class AlertConfig(Model):
    id = fields.IntField(primary_key=True, auto_increment=True)  # Primary key, auto-incremented
    
    service = fields.OneToOneField(
        "models.Service", related_name="alert_config", on_delete=fields.CASCADE
    )
    has_extra_email = fields.BooleanField(default=False, null= True)
    has_teams_slack = fields.BooleanField(default=False, null= True)
    mail_from = fields.CharField(max_length=255, null=True)  # Optional
    mail_cc = fields.CharField(max_length=255, null=True)  # Optional
    mail_to = fields.CharField(max_length=255, null=True)  # Optional
    alert_mail_title = fields.CharField(max_length=255, null=True)  # Optional
    alert_mail_body = fields.TextField(null=True)  # Optional 
    recovery_mail_title = fields.CharField(max_length=255, null=True)  # Optional
    recovery_mail_body = fields.TextField(null=True)  # Optional 
    extra_mail_to=fields.CharField(max_length=255, null=True)  # Optional
    extra_mail_body = fields.TextField(max_length=255, null=True)  # Optional
    slack_link = fields.CharField(max_length=255, null=True)  # Optional
    teams_link = fields.CharField(max_length=255, null=True)  # Optional

    class Meta:
        table = "alert_config"  # Explicitly set the table name

class PublishConfig(Model):
    id = fields.IntField(primary_key=True, auto_increment=True)  # Primary key, auto-incremented
    
    service = fields.OneToOneField(
        "models.Service", related_name="publish_config", on_delete=fields.CASCADE
    )
    alert_publish_title = fields.CharField(max_length=255, null=True)  # Optional
    alert_publish_body = fields.CharField(max_length=511, null=True)  # Optional
    show_influenced_user = fields.BooleanField(default=False, null=True)  # Optional
    send_mail = fields.BooleanField(default=False, null=True)  # Optional

    class Meta:
        table = "publish_config"

class Log(Model):
    id = fields.IntField(primary_key=True)  # Primary key, auto-incremented
    
    service = fields.ForeignKeyField(
        "models.Service", related_name="logs", on_delete=fields.CASCADE
    )
    start_time = fields.DatetimeField(null=True)  # Start time of the service check
    end_time = fields.DatetimeField(null=True)  # End time of the service check
    elapsed_time = fields.FloatField(null=True)  # Elapsed time in seconds
    is_ok = fields.BooleanField(default=True)  # If the service is operational
    screenshot = fields.CharField(max_length=255, null=True)  # Link to screenshot or URL
    content = fields.TextField(null=True)  # Store monitoring logs or messages

    class Meta:
        table = "service_logs"