"""Management CLI for one-off admin tasks."""
import argparse
import asyncio
import os
import sys


async def promote_admin(email: str) -> None:
    import asyncpg

    dsn = os.environ.get("DATABASE_URL", "")
    # asyncpg needs plain postgresql:// not postgresql+asyncpg://
    dsn = dsn.replace("+asyncpg", "")

    if not dsn:
        # Build from individual env vars (Fargate secrets)
        host = os.environ["DB_HOST"]
        port = os.environ["DB_PORT"]
        user = os.environ["DB_USERNAME"]
        password = os.environ["DB_PASSWORD"]
        dbname = os.environ["DB_NAME"]
        dsn = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

    conn = await asyncpg.connect(dsn)
    result = await conn.execute(
        "UPDATE users SET role = 'admin' WHERE email = $1", email
    )
    await conn.close()

    if result == "UPDATE 1":
        print(f"Promoted {email} to admin.")
    else:
        print(f"No user found with email {email}. Result: {result}")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="command")

    promote = sub.add_parser("promote-admin")
    promote.add_argument("--email", required=True)

    args = parser.parse_args()

    if args.command == "promote-admin":
        asyncio.run(promote_admin(args.email))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
