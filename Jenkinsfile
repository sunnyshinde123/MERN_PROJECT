@Library('shared')_
pipeline{
    agent { label "dev" }
    
    stages{
        stage("clone code"){
            steps{
                clone("https://github.com/sunnyshinde123/MERN_PROJECT.git", "$branch")
            }
        }
        stage("Test Code"){
            steps{
                echo "There is no any tests that defined by developer"
            }
        }
        stage("build image"){
            steps{
                dockerbuild("mern-app", "latest")
                echo "Image build successfully"
            }
        }
        stage("docker push build Image"){
            steps{
                dockerpush("dockerhubcred", "mern-app", "latest")
            }
        }
        stage("deploy the application"){
            steps{
                sh "docker compose down"
                sh "docker compose up -d"
                echo "Application running successfully"
            }
        }
    }
}
