#!/usr/bin/env bash
set -euo pipefail

sources=$1
site=$2
mkdir "$site"
cp "$sources/lab10/.github/pages/index.html" "$site/index.html"

for lab in lab1 lab2 lab3 lab4 lab4-tailwind lab5 lab6 lab7 lab9 lab10 lab_krinz2; do
  echo "Building $lab"
  source_dir="$sources/$lab"
  target_dir="$site/$lab"
  mkdir "$target_dir"

  case "$lab" in
    lab1)
      cp -R "$source_dir"/{index.html,css,images} "$target_dir/"
      ;;
    lab2)
      cp -R "$source_dir"/{index.html,css,images,js,data} "$target_dir/"
      ;;
    lab3|lab4|lab4-tailwind)
      build_args=()
      if [[ $lab == lab4 ]]; then
        build_args=(--no-source-map)
      fi
      (cd "$source_dir" && npm ci && npm run build -- "${build_args[@]}")
      cp -R "$source_dir"/{index.html,js} "$target_dir/"
      mkdir -p "$target_dir/dist/css"
      cp "$source_dir/dist/css/main.css" "$target_dir/dist/css/"
      if [[ $lab == lab3 ]]; then
        cp -R "$source_dir"/{images,data} "$target_dir/"
      fi
      ;;
    lab5)
      cp "$source_dir/index.html" "$target_dir/"
      ;;
    lab6|lab7|lab9|lab10|lab_krinz2)
      base="/lab_Web/$lab/"
      (cd "$source_dir" && npm ci && npm run build -- --base "$base")
      cp -R "$source_dir/dist/." "$target_dir/"
      test -d "$target_dir/assets"
      grep -Fq "${base}assets/" "$target_dir/index.html"
      ;;
  esac

  test -s "$target_dir/index.html"
done
