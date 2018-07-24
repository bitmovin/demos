setup_git() {
  git config --global user.email "valentino.zablocki@bitmovin.com"
  git config --global user.name "vzablock"
}

commit_website_files() {
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
  git push
}

setup_git
commit_website_files
