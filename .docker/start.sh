#!/bin/bash

php bin/console cache:clear
apache2-foreground
