from tortoise import fields
from tortoise.models import Model

class UserDatabase(Model):
    id = fields.IntField(primary_key=True)
    username = fields.CharField(max_length=255, unique=True)
    email = fields.CharField(max_length=255, unique=True)
    hashed_password = fields.CharField(max_length=255)
    is_superuser = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)
    can_edit = fields.BooleanField(default=False, null=True)
    services = fields.ManyToManyField('models.ServiceDatabase', related_name="users")

    class Meta:
        table = "users"

class ServiceDatabase(Model):
    id = fields.IntField(primary_key=True)  # Primary key, auto-incremented
    name = fields.CharField(max_length=255, unique=True)  # Unique and required
    sub_name = fields.CharField(max_length=255, unique=True)  # Unique and required

    config: fields.OneToOneRelation["ServiceConfigs"]
    log: fields.OneToOneRelation["ServiceLogs"]

    class Meta:
        table = "services"  # Explicitly set the table name

class ServiceConfigs(Model):
    id = fields.IntField(primary_key=True)  # Primary key, auto-incremented
    
    service = fields.OneToOneField(
        "models.ServiceDatabase", related_name="config", on_delete=fields.CASCADE
                                   )
    email_from = fields.CharField(max_length=255, null=True)  # Optional
    email_cc = fields.CharField(max_length=255, null=True)  # Optional
    email_to = fields.CharField(max_length=255, null=True)  # Optional
    alert_email_title = fields.CharField(max_length=255, null=True)  # Optional
    recovery_email_title = fields.CharField(max_length=255, null=True)  # Optional
    alert_email_body = fields.TextField(null=True)  # Optional
    recovery_email_body = fields.TextField(null=True)  # Optional
    slack_link = fields.CharField(max_length=255, null=True)  # Optional
    teams_link = fields.CharField(max_length=255, null=True)  # Optional

    class Meta:
        table = "service_configs"  # Explicitly set the table name

class ServiceLogs(Model):
    id = fields.IntField(primary_key=True)  # Primary key, auto-incremented
    
    service = fields.OneToOneField(
        "models.ServiceDatabase", related_name="log", on_delete=fields.CASCADE
    )
    start_time = fields.DatetimeField(null=True)  # Start time of the service check
    end_time = fields.DatetimeField(null=True)  # End time of the service check
    elapsed_time = fields.FloatField(null=True)  # Elapsed time in seconds
    is_ok = fields.BooleanField(default=True)  # If the service is operational
    screenshot = fields.CharField(max_length=255, null=True)  # Link to screenshot or URL
    logs = fields.TextField(null=True)  # Store monitoring logs or messages

    class Meta:
        table = "service_logs"