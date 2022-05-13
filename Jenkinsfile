/*
  groovylint-disable
  CompileStatic, 
  DuplicateMapLiteral, 
  DuplicateStringLiteral, 
  GStringExpressionWithinString, 
  NestedBlockDepth 
*/

def PROD = "alumni@alumniime.com.br"
def DEV = "alumni@dev.alumniime.com.br"

pipeline {
  agent any
  
  stages {
    stage('Modules Update') {
      steps {
        script {
          echo 'Selecting Development Server'
          env.SERVER = "${DEV}"
        }

        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh',
          nvmIoJsOrgMirror: 'https://iojs.org/dist',
          nvmNodeJsOrgMirror: 'https://nodejs.org/dist',
          version: '6'
        ) {
            sh '''sftp ${SERVER}<<EOF
            get jenkins-files/node_modules.zip
            '''
            sh 'unzip node_modules.zip'
            sh 'npm install --production=false'
            sh 'rm node_modules.zip'
            sh 'zip -r node_modules.zip node_modules'
            sh '''sftp ${SERVER}<<EOF
            cd jenkins-files
            put node_modules.zip
            '''
            sh 'rm node_modules.zip'
          }
      }
    }
    stage('Build') {
      steps {
        nvm(nvmInstallURL: 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh',
          nvmIoJsOrgMirror: 'https://iojs.org/dist',
          nvmNodeJsOrgMirror: 'https://nodejs.org/dist',
          version: '6'
        ) {
          sh 'node node_modules/gulp/bin/gulp.js build'
        }
      }
    }
    stage('Test') {
      steps {
        echo 'Testing...'
      }
    }
    stage('Deploy') {
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            echo 'Selecting Production Server'
            env.SERVER = "${PROD}"
          }else{
            echo 'Selecting Development Server'
            env.SERVER = "${DEV}"
          }
        }
        echo "Selected Server: ${SERVER}"
        
        sh 'rm -r dist/client/assets'
        sh 'zip -r dist.zip dist'
        sh '''sftp ${SERVER}<<EOF
        put dist.zip
        '''
        sh '''ssh ${SERVER}<<EOF
        unzip -o jenkins-files/node_modules.zip
        cp -r node_modules/ website/
        rm -r node_modules/
        '''
        sh '''ssh ${SERVER}<<EOF
        unzip dist
        rm website/client/*
        cp -r dist/* website/
        rm -r dist.zip dist/
        pm2 reload all
        '''
      }
    }
  }

  post {
    always {
      deleteDir()
    }
  }
}
