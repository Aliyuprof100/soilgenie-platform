import os

from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create or verify the SoilGenie production administrator."

    def handle(self, *args, **options):
        email = os.getenv("PRODUCTION_ADMIN_EMAIL")
        password = os.getenv("PRODUCTION_ADMIN_PASSWORD")
        first_name = os.getenv("PRODUCTION_ADMIN_FIRST_NAME", "SoilGenie")
        last_name = os.getenv("PRODUCTION_ADMIN_LAST_NAME", "Administrator")
        phone_number = os.getenv("PRODUCTION_ADMIN_PHONE")

        if not email:
            raise CommandError(
                "PRODUCTION_ADMIN_EMAIL is not configured."
            )

        if not password:
            raise CommandError(
                "PRODUCTION_ADMIN_PASSWORD is not configured."
            )

        if not phone_number:
            raise CommandError(
                "PRODUCTION_ADMIN_PHONE is not configured."
            )

        user = User.objects.filter(email__iexact=email).first()

        if user:
            changed = False

            if user.role != User.Roles.ADMIN:
                user.role = User.Roles.ADMIN
                changed = True

            if not user.is_staff:
                user.is_staff = True
                changed = True

            if not user.is_superuser:
                user.is_superuser = True
                changed = True

            if not user.is_active:
                user.is_active = True
                changed = True

            if changed:
                user.save(
                    update_fields=[
                        "role",
                        "is_staff",
                        "is_superuser",
                        "is_active",
                        "last_updated",
                    ]
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Production administrator verified: {user.email}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Production administrator already exists: {user.email}"
                    )
                )

            return

        if User.objects.filter(phone_number=phone_number).exists():
            raise CommandError(
                "PRODUCTION_ADMIN_PHONE is already associated "
                "with another user."
            )

        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Production administrator created successfully: {user.email}"
            )
        )