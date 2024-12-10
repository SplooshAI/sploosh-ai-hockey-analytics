# Welcome

You can view the [demo](https://nhl-shot-chart.vercel.app/) on Vercel at [https://nhl-shot-chart.vercel.app/](https://nhl-shot-chart.vercel.app/)

## Background

This project was initially created on `Thu May 25 19:07:08 2023 -0700` to generate a shot chart using game data provided by the NHL. It was initially based on the previous NHL stats API [https://statsapi.web.nhl.com/api/v1](https://statsapi.web.nhl.com/api/v1), which was deprecated on `November 7th, 2023`.

This change completely broke my initial NHL shot chart implementation.

Work is underway to rewrite the NHL shot chart to accommodate the new endpoints and data structure, though no release date has been targeted as of this writing.

**IMPORTANT:** The NHL Edge API is publicly available; however, it is undocumented and subject to change. [@Zmalski](https://github.com/Zmalski) has created an excellent repo at [https://github.com/Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference) which is a fantastic guide for working with the NHL Edge API in your projects.

## Prerequisites

Please make sure that you have the following installed on your development environment:

- [Node.js](https://nodejs.org/en)

This code base was initially developed and tested on:

- 2021 14" MacBook Pro
  - Apple M1 Max
  - 64 GB memory
  - 2 TB SSD
  - macOS Sequoia `15.1.1`
    - Node.js `v20.18.0`
    - npm `10.8.2`
