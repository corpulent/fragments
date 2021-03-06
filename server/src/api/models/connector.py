import os
import contextlib
from chardet import detect
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.fernet import Fernet

from django.db import models
from organizations.models import Organization


ENCRYPT_DATA = os.environ.get("ENCRYPT_DATA", "False").lower() == "true"
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", None)
ENCODING = "utf-8"


def encrypt_data(value):
    f = Fernet(ENCRYPTION_KEY)
    return f.encrypt(value)


def decrypt_data(value):
    f = Fernet(ENCRYPTION_KEY)
    return f.decrypt(value)


class DataField(models.BinaryField):
    description = "Encrypted value"

    def get_prep_value(self, value):
        as_bytes = value.encode(ENCODING)

        if ENCRYPT_DATA and ENCRYPTION_KEY:
            return encrypt_data(as_bytes)

        return as_bytes

    def decode_value(self, value):
        encoding = detect(value)["encoding"]

        if encoding := detect(value)["encoding"]:
            return value.decode(encoding)

        return value

    def extract_value(self, value):
        as_bytes = bytes(value)

        if ENCRYPT_DATA and ENCRYPTION_KEY:
            with contextlib.suppress(ValueError):
                decrypted = decrypt_data(as_bytes)
                return self.decode_value(decrypted)

        return self.decode_value(as_bytes)

    def from_db_value(self, value, expression, connection):
        return self.extract_value(value)

    def to_python(self, value):
        return self.extract_value(value)


class Connector(models.Model):
    org = models.ForeignKey(
        Organization,
        blank=True,
        null=True,
        related_name="connectors",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=500, blank=False, null=False, default="Untitled")
    data = DataField()
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Connector"
        verbose_name_plural = "Connectors"
        ordering = ["-created_at"]
