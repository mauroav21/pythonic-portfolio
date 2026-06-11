import reflex as rx
from portfolio.styles.styles import tailwind_config

config = rx.Config(
    app_name="portfolio",
    plugins=[rx.plugins.TailwindV4Plugin(tailwind_config), rx.plugins.sitemap.SitemapPlugin()],
    frontend_packages=[
        "tailwindcss-animated",
    ],
    show_built_with_reflex=False,
    telemetry_enabled=False,
    backend_exception_handler=None,
)
