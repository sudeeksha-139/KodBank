#!/bin/bash
# Build script for Vercel
mkdir -p public
cp -r frontend/* public/
cd backend && npm install
