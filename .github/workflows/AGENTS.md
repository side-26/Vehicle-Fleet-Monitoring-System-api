# CI Workflows

`checks.yml` runs the Node API checks and tests with an isolated Redis service. Session integration
tests use Redis database 15 and never flush a shared database.
