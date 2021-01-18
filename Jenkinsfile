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
            sh '''sftp alumni@dev.alumniime.com.br<<EOF
            get jenkins-files/node_modules.zip
            '''
            //sh 'unzip node_modules.zip'
            //sh 'npm install --production=false'
            //sh 'rm node_modules.zip'
            //sh 'zip -r node_modules.zip node_modules'
            //sh '''sftp alumni@dev.alumniime.com.br<<EOF
            //cd jenkins-files
            //put node_modules.zip
            //'''
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
        //sh 'node node_modules/gulp/bin/gulp.js build'
        }
      }
    }
    stage('Test') {
      steps {
        echo 'Testing...'
      }
    }
    /*
    stage('Selecting Server') {
      steps {
        sh '''ssh ${SERVER} << EOF ls -l'''
        echo "${SERVER}"
        sh 'echo ${SERVER}'
        script {
          if (env.BRANCH_NAME == 'dev') {
            echo 'Selecting Production Server'
            echo "${PROD}"
            env.SERVER = "${PROD}"
          }else{
            echo 'Selecting Development Server'
          }
        }
        echo "${SERVER}"
        sh 'echo ${SERVER}'
      }
    }
    */
    stage('Deploy') {
      steps {
        echo "${SERVER}"
        sh 'echo ${SERVER}'
        script {
          if (env.BRANCH_NAME == 'dev') {
            echo 'Selecting Production Server'
            echo "${PROD}"
            env.SERVER = "${PROD}"
          }else{
            echo 'Selecting Development Server'
          }
        }
        echo "${SERVER}"
        sh 'echo ${SERVER}'
        /*
        sh 'rm -r dist/client/assets'
        sh 'zip -r dist.zip dist'
        sh '''sftp alumni@dev.alumniime.com.br<<EOF
        put dist.zip
        '''
        sh '''ssh alumni@dev.alumniime.com.br<<EOF
        unzip dist
        rm website/client/*
        cp -r dist/* website/
        rm -r dist.zip dist/
        '''
        */
      }
    }
  }
}
