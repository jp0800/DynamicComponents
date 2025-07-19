Great! Let’s now implement the Production Deployment version that works similarly to your Dev setup — but triggered only when merging to the main branch and deploying to a separate EC2 Production server.


---

✅ Goal:

When you merge to main, GitLab automatically deploys your fullstack app to the Production EC2 instance using Docker and SSH.


---

🪜 Steps to Implement Production Deployment


---

🟩 1. ✅ Set Up a Separate EC2 Prod Instance

Launch another EC2 instance (e.g., prod.yourdomain.com).

Install:

Docker

Docker Compose

Git


Open security group ports: 22, 80, 443



---

🟨 2. ✅ Create a Deploy Key for Production

From your machine:

ssh-keygen -t rsa -b 4096 -f gitlab-prod-key

gitlab-prod-key → private (used in GitLab CI)

gitlab-prod-key.pub → public (used on EC2)



---

🟨 3. ✅ Add Key to EC2 Production Instance

SSH into the Prod server:

ssh -i your-prod-key.pem ubuntu@<EC2_PROD_IP>

Then:

mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the contents of gitlab-prod-key.pub
chmod 600 ~/.ssh/authorized_keys


---

🟨 4. ✅ Add Key to GitLab CI/CD Variables

Go to:

> GitLab → Project → Settings → CI/CD → Variables



Add:

Key	Value (paste content of file)	Type	Protect	Mask

PROD_SSH_KEY	Contents of gitlab-prod-key	File	✅ Yes	✅ Yes



---

🟦 5. ✅ Update .gitlab-ci.yml for Dev + Production

Here’s a complete setup supporting both dev and prod:

image: docker:20.10
services:
  - docker:dind

stages:
  - deploy

before_script:
  - apk add --no-cache openssh

# Deploy to Development Server (on dev branch)
deploy_dev:
  stage: deploy
  rules:
    - if: '$CI_COMMIT_BRANCH == "dev"'
      when: always
  script:
    - echo "$DEV_SSH_KEY" > dev_key.pem
    - chmod 600 dev_key.pem
    - ssh -o StrictHostKeyChecking=no -i dev_key.pem ubuntu@<EC2_DEV_PUBLIC_IP> "
        cd /home/ubuntu/your-repo &&
        git pull &&
        docker-compose down &&
        docker-compose up -d --build
      "

# Deploy to Production Server (on main branch)
deploy_prod:
  stage: deploy
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: always
  script:
    - echo "$PROD_SSH_KEY" > prod_key.pem
    - chmod 600 prod_key.pem
    - ssh -o StrictHostKeyChecking=no -i prod_key.pem ubuntu@<EC2_PROD_PUBLIC_IP> "
        cd /home/ubuntu/your-repo &&
        git pull &&
        docker-compose down &&
        docker-compose up -d --build
      "


---

🧪 6. ✅ Test Production Deployment

1. Merge your changes from dev or feature to main:

git checkout main
git merge dev
git push origin main


2. GitLab CI/CD will:

Detect the push to main

Run deploy_prod

SSH into your Prod EC2

Pull the code

Rebuild Docker containers

Restart your app





---

🧠 Optional Enhancements

Feature	How

Zero Downtime Deploy	Use docker-compose up -d --build with named volumes
Environment Variables	Use .env file or export in the deploy script
Notifications	Add Slack or email notifications in .gitlab-ci.yml
Domain/SSL	Add Nginx or Caddy + Let’s Encrypt on EC2
Approvals	GitLab > Settings > Merge Request Approvals



---

✅ Summary Table

Env	Branch	CI/CD Job	Server	Trigger

Dev	dev	deploy_dev	EC2 Dev	Push or merge to dev
Prod	main	deploy_prod	EC2 Prod	Push or merge to main



---

Would you like help:

Creating a docker-compose.yml that runs both frontend and backend?

Setting up a domain + SSL for your prod instance?

Or a shell script to bootstrap your EC2 servers with all prerequisites?

