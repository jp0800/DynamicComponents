Absolutely! Here's a complete walkthrough on how to implement automatic deployment to a Dev EC2 server from a GitLab repository whenever you merge a sprint/feature branch into dev.


---

✅ Goal:

> When you merge any branch into dev, your EC2 Dev instance is automatically updated with the latest code and containers via GitLab CI/CD.




---

🔧 Prerequisites (Already Done)

Docker + Docker Compose installed on EC2 Dev

GitLab repository is ready

dev branch exists

EC2 Dev instance is publicly accessible via IP or domain

SSH access to EC2 from GitLab CI via deploy key



---

🪜 Step-by-Step Implementation


---

🟩 1. ✅ Generate and Configure Deploy Key (One-Time Setup)

On your local machine or GitLab runner:

ssh-keygen -t rsa -b 4096 -f gitlab-dev-key

You now have:

gitlab-dev-key (private)

gitlab-dev-key.pub (public)



---

Copy gitlab-dev-key.pub to the EC2 Dev instance:

# On EC2
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the content of gitlab-dev-key.pub
chmod 600 ~/.ssh/authorized_keys


---

Add gitlab-dev-key to GitLab:

Go to:

> GitLab → Project → Settings → CI/CD → Variables



Add:

Key	Value (paste content of file)	Type	Protect	Mask

DEV_SSH_KEY	Contents of gitlab-dev-key	File	✅ Yes	✅ Yes



---

🟩 2. ✅ SSH Test From GitLab Runner (Optional)

Test with GitLab runner or use a dummy pipeline to ensure SSH works.


---

🟨 3. ✅ Create .gitlab-ci.yml in your repo

image: docker:20.10
services:
  - docker:dind

stages:
  - deploy

before_script:
  - apk add --no-cache openssh

deploy_dev:
  stage: deploy
  rules:
    - if: '$CI_COMMIT_BRANCH == "dev"'
      when: always
  script:
    # Write SSH key to a temporary file
    - echo "$DEV_SSH_KEY" > dev_key.pem
    - chmod 600 dev_key.pem

    # Connect to EC2 and deploy
    - ssh -o StrictHostKeyChecking=no -i dev_key.pem ubuntu@<EC2_DEV_PUBLIC_IP> "
        cd /home/ubuntu/your-repo &&
        git pull &&
        docker-compose down &&
        docker-compose up -d --build
      "

📌 Replace:

<EC2_DEV_PUBLIC_IP> with your actual EC2 IP

your-repo with your actual project directory



---

🟨 4. ✅ Push and Merge to Trigger CI/CD

1. Work on a sprint branch:

git checkout -b sprint-42
git add .
git commit -m "Feature X"
git push origin sprint-42


2. Create a merge request from sprint-42 → dev.


3. When the merge happens:

GitLab detects change to dev

Runs the deploy_dev job

SSHs into your EC2 Dev server

Pulls latest code and rebuilds Docker containers





---

🟩 5. ✅ Optional: Improve CI Security

Add StrictHostKeyChecking=yes with known hosts file (optional)

Add a DEPLOY_PATH variable

Use tmux or nohup on EC2 to run background tasks



---

📌 Summary

Step	Description

1	Generate SSH key for GitLab → EC2
2	Add public key to EC2
3	Add private key to GitLab CI variables
4	Set up .gitlab-ci.yml with rules: block
5	Merge to dev to trigger auto-deployment



---

Would you like:

A production version for the main branch?

Or a repo template for fullstack with docker-compose.yml already configured?


