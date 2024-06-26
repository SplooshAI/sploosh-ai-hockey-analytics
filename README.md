# Welcome

![](./apps/nhl-shot-chart-fastapi/__screenshots__/coverage.svg)

You can view the [demo](https://nhl-shot-chart.vercel.app/) on Vercel at [https://nhl-shot-chart.vercel.app/](https://nhl-shot-chart.vercel.app/)

![](./apps/nhl-shot-chart-fastapi/__screenshots__/01.png)

## Background

This project was initially created on `Thu May 25 19:07:08 2023 -0700` to generate a shot chart using game data provided by the NHL. It was originally based on the previous NHL stats API [https://statsapi.web.nhl.com/api/v1](https://statsapi.web.nhl.com/api/v1), which was deprecated on `November 7th, 2023`.

This change completely broke my initial NHL shot chart implementation.

Work is underway to rewrite the NHL shot chart to accommodate the new endpoints and data structure, though no release date has been targeted as of this writing.

**IMPORTANT:** The NHL Edge API is publicly available; however, it is undocumented and subject to change. [@Zmalski](https://github.com/Zmalski) has created an excellent repo at [https://github.com/Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference) which is a fantastic guide for working with the NHL Edge API in your projects.

## Getting started

### Prerequisites

Please make sure that you have the following installed on your development environment:

- [Node.js](https://nodejs.org/en)
- [Python](https://www.python.org)

This code base was initially developed and tested on:

- 2021 14" MacBook Pro
  - Apple M1 Max
  - 64 GB memory
  - 2 TB SSD
  - macOS Sonoma `14.5`
    - Node.js `v20.11.1`
    - npm `10.8.1`
    - Python `3.11.1`

### Scripts

This project includes several scripts to get you up and running with your local development environment using `npm` (e.g. `npm run setup`):

- `setup`
  - This script checks to see if a Python virtual environment has been created at `apps/nhl-shot-chart-fastapi/.venv` and installs dependencies from [apps/nhl-shot-chart-fastapi/requirements.txt](./apps/nhl-shot-chart-fastapi/requirements.txt) before starting the server locally at [http://localhost:8000/](http://localhost:8000/)

- `start`
  - This script uses the Python virtual environment at `apps/nhl-shot-chart-fastapi/.venv` to start the server locally at [http://localhost:8000/](http://localhost:8000/)

- `test`
  - This script uses the Python virtual environment at `apps/nhl-shot-chart-fastapi/.venv` and runs the unit tests for our shot chart application

- `test:coverage`
  - This script uses the Python virtual environment at `apps/nhl-shot-chart-fastapi/.venv`, runs the unit tests for our shot chart application, and generates an HTML coverage report at [./apps/nhl-shot-chart-fastapi/htmlcov/index.html](./apps/nhl-shot-chart-fastapi/htmlcov/index.html) that will automatically open in the default web browser on macOS.

- `destroy`
  - This script removes the Python virtual environment at `apps/nhl-shot-chart-fastapi/.venv`
