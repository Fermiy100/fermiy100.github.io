#!/bin/bash
cd frontend
npm install
npm run build
cd ..
cp -r frontend/dist/* .
