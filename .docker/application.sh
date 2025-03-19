#!/bin/bash
set -e

php bin/console cache:clear
exec apache2-foreground
