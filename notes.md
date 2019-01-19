(should this be in the readme?)
# Fork a new repo for Jumpstart w/ IOTACSS —

To “fork” your own repo on github you must
- create a new blank repo with a unique name on github
- clone the new empty repo to your local drive git clone <originalRepo> <newProjectName>
- add upstream on the new local repo to the repo you are forking from: git remote add upstream <originalRepo>
- verify upstream address: git remote -v
- fetch from the upstream repo (original): git fetch upstream
- set remote origin to new project github repo: git remote set-url origin <newProjectRepo>
- verify origin address: git remote -v
- push “forked” local project to origin (new “forked” repo on GitHub): git push origin master
- if there are branches on the original repo, they are there, just hidden. checkout to initialize local branch.
- push local branches to origin

- [x] Clone a local copy of Jumspstart w/ IOTACSS

- [x] Restage the IOTACSS first commit and break it up into smaller commits

- [x] merge the branch into the master

- [x] close

— Fork a new repo of Jumpstart for Jumpstart w/ Minicss —

Remove the IOTACSS branch and test to see that minicss is still operational

close

— Switch to Jumpstart original repo —

- [x] Remove any css frameworks, only JSF sass partials in styles.scss and test

- [x] Push changes to github

- [x] close

— Switch to Jumpstart w/ Minicss —

Set Upstream as Jumpstart original repo

fetch and test

commit and push to Github

close

— Switch to Jumpstart w/ IOTACSS —

- [x] Set Upstream as Jumpstart original repo

- [x] fetch from upstream and test

- [x] commit and push to Github

- [x] close
