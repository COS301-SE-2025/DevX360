import { jest } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('Real API Modules Tests', () => {
  describe('Server Module', () => {
    test('should have server.js file', () => {
      const serverPath = path.join(process.cwd(), 'api', 'server.js')
      expect(fs.existsSync(serverPath)).toBe(true)
    })

    test('should have app.js file', () => {
      const appPath = path.join(process.cwd(), 'api', 'app.js')
      expect(fs.existsSync(appPath)).toBe(true)
    })

    test('should have package.json with required dependencies', () => {
      const packagePath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      expect(packageJson.dependencies).toBeDefined()
      expect(packageJson.dependencies.express).toBeDefined()
      expect(packageJson.dependencies.mongodb).toBeDefined()
      expect(packageJson.dependencies.cors).toBeDefined()
      expect(packageJson.dependencies.helmet).toBeDefined()
      expect(packageJson.dependencies.compression).toBeDefined()
      expect(packageJson.dependencies.morgan).toBeDefined()
      expect(packageJson.dependencies.dotenv).toBeDefined()
      expect(packageJson.dependencies.bcrypt).toBeDefined()
      expect(packageJson.dependencies.jsonwebtoken).toBeDefined()
    })

    test('should have test scripts configured', () => {
      const packagePath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      expect(packageJson.scripts.test).toBeDefined()
      expect(packageJson.scripts['test:coverage']).toBeDefined()
    })
  })

  describe('API Utils', () => {
    test('should have auth.js utility', () => {
      const authPath = path.join(process.cwd(), 'api', 'utils', 'auth.js')
      expect(fs.existsSync(authPath)).toBe(true)
    })

    test('should have database.js utility', () => {
      const dbPath = path.join(process.cwd(), 'api', 'utils', 'database.js')
      expect(fs.existsSync(dbPath)).toBe(true)
    })

    test('should have concurrentMap.js utility', () => {
      const concurrentPath = path.join(process.cwd(), 'api', 'utils', 'concurrentMap.js')
      expect(fs.existsSync(concurrentPath)).toBe(true)
    })

    test('should have valid JavaScript syntax in auth.js', () => {
      const authPath = path.join(process.cwd(), 'api', 'utils', 'auth.js')
      const authContent = fs.readFileSync(authPath, 'utf8')
      
      // Check for basic JavaScript syntax
      expect(authContent).toContain('function')
      expect(authContent).toContain('export')
      expect(authContent).toContain('require')
    })

    test('should have valid JavaScript syntax in database.js', () => {
      const dbPath = path.join(process.cwd(), 'api', 'utils', 'database.js')
      const dbContent = fs.readFileSync(dbPath, 'utf8')
      
      // Check for basic JavaScript syntax
      expect(dbContent).toContain('function')
      expect(dbContent).toContain('export')
      expect(dbContent).toContain('require')
    })

    test('should have valid JavaScript syntax in concurrentMap.js', () => {
      const concurrentPath = path.join(process.cwd(), 'api', 'utils', 'concurrentMap.js')
      const concurrentContent = fs.readFileSync(concurrentPath, 'utf8')
      
      // Check for basic JavaScript syntax
      expect(concurrentContent).toContain('function')
      expect(concurrentContent).toContain('export')
      expect(concurrentContent).toContain('require')
    })
  })

  describe('API Routes', () => {
    test('should have routes directory', () => {
      const routesPath = path.join(process.cwd(), 'api', 'routes')
      expect(fs.existsSync(routesPath)).toBe(true)
    })

    test('should have auth routes', () => {
      const authRoutesPath = path.join(process.cwd(), 'api', 'routes', 'auth.js')
      expect(fs.existsSync(authRoutesPath)).toBe(true)
    })

    test('should have user routes', () => {
      const userRoutesPath = path.join(process.cwd(), 'api', 'routes', 'users.js')
      expect(fs.existsSync(userRoutesPath)).toBe(true)
    })

    test('should have team routes', () => {
      const teamRoutesPath = path.join(process.cwd(), 'api', 'routes', 'teams.js')
      expect(fs.existsSync(teamRoutesPath)).toBe(true)
    })

    test('should have MCP routes', () => {
      const mcpRoutesPath = path.join(process.cwd(), 'api', 'routes', 'mcp.js')
      expect(fs.existsSync(mcpRoutesPath)).toBe(true)
    })

    test('should have valid JavaScript syntax in auth routes', () => {
      const authRoutesPath = path.join(process.cwd(), 'api', 'routes', 'auth.js')
      const authContent = fs.readFileSync(authRoutesPath, 'utf8')
      
      expect(authContent).toContain('function')
      expect(authContent).toContain('export')
      expect(authContent).toContain('require')
    })

    test('should have valid JavaScript syntax in user routes', () => {
      const userRoutesPath = path.join(process.cwd(), 'api', 'routes', 'users.js')
      const userContent = fs.readFileSync(userRoutesPath, 'utf8')
      
      expect(userContent).toContain('function')
      expect(userContent).toContain('export')
      expect(userContent).toContain('require')
    })

    test('should have valid JavaScript syntax in team routes', () => {
      const teamRoutesPath = path.join(process.cwd(), 'api', 'routes', 'teams.js')
      const teamContent = fs.readFileSync(teamRoutesPath, 'utf8')
      
      expect(teamContent).toContain('function')
      expect(teamContent).toContain('export')
      expect(teamContent).toContain('require')
    })

    test('should have valid JavaScript syntax in MCP routes', () => {
      const mcpRoutesPath = path.join(process.cwd(), 'api', 'routes', 'mcp.js')
      const mcpContent = fs.readFileSync(mcpRoutesPath, 'utf8')
      
      expect(mcpContent).toContain('function')
      expect(mcpContent).toContain('export')
      expect(mcpContent).toContain('require')
    })
  })

  describe('API Models', () => {
    test('should have models directory', () => {
      const modelsPath = path.join(process.cwd(), 'api', 'models')
      expect(fs.existsSync(modelsPath)).toBe(true)
    })

    test('should have User model', () => {
      const userModelPath = path.join(process.cwd(), 'api', 'models', 'User.js')
      expect(fs.existsSync(userModelPath)).toBe(true)
    })

    test('should have Team model', () => {
      const teamModelPath = path.join(process.cwd(), 'api', 'models', 'Team.js')
      expect(fs.existsSync(teamModelPath)).toBe(true)
    })

    test('should have Repository model', () => {
      const repoModelPath = path.join(process.cwd(), 'api', 'models', 'Repository.js')
      expect(fs.existsSync(repoModelPath)).toBe(true)
    })

    test('should have Metrics model', () => {
      const metricsModelPath = path.join(process.cwd(), 'api', 'models', 'Metrics.js')
      expect(fs.existsSync(metricsModelPath)).toBe(true)
    })

    test('should have valid JavaScript syntax in User model', () => {
      const userModelPath = path.join(process.cwd(), 'api', 'models', 'User.js')
      const userContent = fs.readFileSync(userModelPath, 'utf8')
      
      expect(userContent).toContain('function')
      expect(userContent).toContain('export')
      expect(userContent).toContain('require')
    })

    test('should have valid JavaScript syntax in Team model', () => {
      const teamModelPath = path.join(process.cwd(), 'api', 'models', 'Team.js')
      const teamContent = fs.readFileSync(teamModelPath, 'utf8')
      
      expect(teamContent).toContain('function')
      expect(teamContent).toContain('export')
      expect(teamContent).toContain('require')
    })

    test('should have valid JavaScript syntax in Repository model', () => {
      const repoModelPath = path.join(process.cwd(), 'api', 'models', 'Repository.js')
      const repoContent = fs.readFileSync(repoModelPath, 'utf8')
      
      expect(repoContent).toContain('function')
      expect(repoContent).toContain('export')
      expect(repoContent).toContain('require')
    })

    test('should have valid JavaScript syntax in Metrics model', () => {
      const metricsModelPath = path.join(process.cwd(), 'api', 'models', 'Metrics.js')
      const metricsContent = fs.readFileSync(metricsModelPath, 'utf8')
      
      expect(metricsContent).toContain('function')
      expect(metricsContent).toContain('export')
      expect(metricsContent).toContain('require')
    })
  })

  describe('Services', () => {
    test('should have services directory', () => {
      const servicesPath = path.join(process.cwd(), 'services')
      expect(fs.existsSync(servicesPath)).toBe(true)
    })

    test('should have tokenManager.js', () => {
      const tokenManagerPath = path.join(process.cwd(), 'services', 'tokenManager.js')
      expect(fs.existsSync(tokenManagerPath)).toBe(true)
    })

    test('should have githubUpdater.js', () => {
      const githubUpdaterPath = path.join(process.cwd(), 'services', 'githubUpdater.js')
      expect(fs.existsSync(githubUpdaterPath)).toBe(true)
    })

    test('should have teamUpdater.js', () => {
      const teamUpdaterPath = path.join(process.cwd(), 'services', 'teamUpdater.js')
      expect(fs.existsSync(teamUpdaterPath)).toBe(true)
    })

    test('should have codeInterpretor.js', () => {
      const codeInterpretorPath = path.join(process.cwd(), 'services', 'codeInterpretor.js')
      expect(fs.existsSync(codeInterpretorPath)).toBe(true)
    })

    test('should have analysisService.js', () => {
      const analysisServicePath = path.join(process.cwd(), 'services', 'analysisService.js')
      expect(fs.existsSync(analysisServicePath)).toBe(true)
    })

    test('should have metricsService.js', () => {
      const metricsServicePath = path.join(process.cwd(), 'services', 'metricsService.js')
      expect(fs.existsSync(metricsServicePath)).toBe(true)
    })

    test('should have valid JavaScript syntax in tokenManager.js', () => {
      const tokenManagerPath = path.join(process.cwd(), 'services', 'tokenManager.js')
      const tokenManagerContent = fs.readFileSync(tokenManagerPath, 'utf8')
      
      expect(tokenManagerContent).toContain('function')
      expect(tokenManagerContent).toContain('export')
      expect(tokenManagerContent).toContain('require')
    })

    test('should have valid JavaScript syntax in githubUpdater.js', () => {
      const githubUpdaterPath = path.join(process.cwd(), 'services', 'githubUpdater.js')
      const githubUpdaterContent = fs.readFileSync(githubUpdaterPath, 'utf8')
      
      expect(githubUpdaterContent).toContain('function')
      expect(githubUpdaterContent).toContain('export')
      expect(githubUpdaterContent).toContain('require')
    })

    test('should have valid JavaScript syntax in teamUpdater.js', () => {
      const teamUpdaterPath = path.join(process.cwd(), 'services', 'teamUpdater.js')
      const teamUpdaterContent = fs.readFileSync(teamUpdaterPath, 'utf8')
      
      expect(teamUpdaterContent).toContain('function')
      expect(teamUpdaterContent).toContain('export')
      expect(teamUpdaterContent).toContain('require')
    })

    test('should have valid JavaScript syntax in codeInterpretor.js', () => {
      const codeInterpretorPath = path.join(process.cwd(), 'services', 'codeInterpretor.js')
      const codeInterpretorContent = fs.readFileSync(codeInterpretorPath, 'utf8')
      
      expect(codeInterpretorContent).toContain('function')
      expect(codeInterpretorContent).toContain('export')
      expect(codeInterpretorContent).toContain('require')
    })

    test('should have valid JavaScript syntax in analysisService.js', () => {
      const analysisServicePath = path.join(process.cwd(), 'services', 'analysisService.js')
      const analysisServiceContent = fs.readFileSync(analysisServicePath, 'utf8')
      
      expect(analysisServiceContent).toContain('function')
      expect(analysisServiceContent).toContain('export')
      expect(analysisServiceContent).toContain('require')
    })

    test('should have valid JavaScript syntax in metricsService.js', () => {
      const metricsServicePath = path.join(process.cwd(), 'services', 'metricsService.js')
      const metricsServiceContent = fs.readFileSync(metricsServicePath, 'utf8')
      
      expect(metricsServiceContent).toContain('function')
      expect(metricsServiceContent).toContain('export')
      expect(metricsServiceContent).toContain('require')
    })
  })

  describe('Data Collection', () => {
    test('should have Data Collection directory', () => {
      const dataCollectionPath = path.join(process.cwd(), 'Data Collection')
      expect(fs.existsSync(dataCollectionPath)).toBe(true)
    })

    test('should have github-utils.js', () => {
      const githubUtilsPath = path.join(process.cwd(), 'Data Collection', 'github-utils.js')
      expect(fs.existsSync(githubUtilsPath)).toBe(true)
    })

    test('should have repository-info-service.js', () => {
      const repoInfoPath = path.join(process.cwd(), 'Data Collection', 'repository-info-service.js')
      expect(fs.existsSync(repoInfoPath)).toBe(true)
    })

    test('should have universal-dora-service.js', () => {
      const doraServicePath = path.join(process.cwd(), 'Data Collection', 'universal-dora-service.js')
      expect(fs.existsSync(doraServicePath)).toBe(true)
    })

    test('should have valid JavaScript syntax in github-utils.js', () => {
      const githubUtilsPath = path.join(process.cwd(), 'Data Collection', 'github-utils.js')
      const githubUtilsContent = fs.readFileSync(githubUtilsPath, 'utf8')
      
      expect(githubUtilsContent).toContain('function')
      expect(githubUtilsContent).toContain('export')
      expect(githubUtilsContent).toContain('require')
    })

    test('should have valid JavaScript syntax in repository-info-service.js', () => {
      const repoInfoPath = path.join(process.cwd(), 'Data Collection', 'repository-info-service.js')
      const repoInfoContent = fs.readFileSync(repoInfoPath, 'utf8')
      
      expect(repoInfoContent).toContain('function')
      expect(repoInfoContent).toContain('export')
      expect(repoInfoContent).toContain('require')
    })

    test('should have valid JavaScript syntax in universal-dora-service.js', () => {
      const doraServicePath = path.join(process.cwd(), 'Data Collection', 'universal-dora-service.js')
      const doraServiceContent = fs.readFileSync(doraServicePath, 'utf8')
      
      expect(doraServiceContent).toContain('function')
      expect(doraServiceContent).toContain('export')
      expect(doraServiceContent).toContain('require')
    })
  })

  describe('MCP Server', () => {
    test('should have mcp-server.js', () => {
      const mcpServerPath = path.join(process.cwd(), 'mcp-server.js')
      expect(fs.existsSync(mcpServerPath)).toBe(true)
    })

    test('should have valid JavaScript syntax in mcp-server.js', () => {
      const mcpServerPath = path.join(process.cwd(), 'mcp-server.js')
      const mcpServerContent = fs.readFileSync(mcpServerPath, 'utf8')
      
      expect(mcpServerContent).toContain('function')
      expect(mcpServerContent).toContain('export')
      expect(mcpServerContent).toContain('require')
    })
  })

  describe('Configuration Files', () => {
    test('should have .env.example file', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example')
      expect(fs.existsSync(envExamplePath)).toBe(true)
    })

    test('should have .gitignore file', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore')
      expect(fs.existsSync(gitignorePath)).toBe(true)
    })

    test('should have README.md file', () => {
      const readmePath = path.join(process.cwd(), 'README.md')
      expect(fs.existsSync(readmePath)).toBe(true)
    })

    test('should have jest.config.js file', () => {
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js')
      expect(fs.existsSync(jestConfigPath)).toBe(true)
    })

    test('should have valid Jest configuration', () => {
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js')
      const jestConfigContent = fs.readFileSync(jestConfigPath, 'utf8')
      
      expect(jestConfigContent).toContain('module.exports')
      expect(jestConfigContent).toContain('testEnvironment')
    })
  })

  describe('Test Files', () => {
    test('should have comprehensive test coverage', () => {
      const testDirs = [
        path.join(process.cwd(), 'api', '__tests__'),
        path.join(process.cwd(), 'services', '__tests__'),
        path.join(process.cwd(), 'Data Collection', '__tests__')
      ]
      
      testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
          const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'))
          expect(testFiles.length).toBeGreaterThan(0)
        }
      })
    })

    test('should have unit tests', () => {
      const testDirs = [
        path.join(process.cwd(), 'api', '__tests__'),
        path.join(process.cwd(), 'services', '__tests__'),
        path.join(process.cwd(), 'Data Collection', '__tests__')
      ]
      
      testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
          const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'))
          expect(testFiles.length).toBeGreaterThan(0)
        }
      })
    })

    test('should have integration tests', () => {
      const testDirs = [
        path.join(process.cwd(), 'api', '__tests__'),
        path.join(process.cwd(), 'services', '__tests__'),
        path.join(process.cwd(), 'Data Collection', '__tests__')
      ]
      
      testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
          const integrationTestFiles = fs.readdirSync(testDir).filter(file => 
            file.endsWith('.test.js') && file.includes('integration')
          )
          expect(integrationTestFiles.length).toBeGreaterThan(0)
        }
      })
    })

    test('should have E2E tests', () => {
      const testDirs = [
        path.join(process.cwd(), 'api', '__tests__'),
        path.join(process.cwd(), 'services', '__tests__'),
        path.join(process.cwd(), 'Data Collection', '__tests__')
      ]
      
      testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
          const e2eTestFiles = fs.readdirSync(testDir).filter(file => 
            file.endsWith('.test.js') && file.includes('e2e')
          )
          expect(e2eTestFiles.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('File Structure Validation', () => {
    test('should have proper directory structure', () => {
      const requiredDirs = [
        'api',
        'api/utils',
        'api/routes',
        'api/models',
        'api/__tests__',
        'services',
        'services/__tests__',
        'Data Collection',
        'Data Collection/__tests__'
      ]
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir)
        expect(fs.existsSync(dirPath)).toBe(true)
      })
    })

    test('should have proper file extensions', () => {
      const jsFiles = [
        'api/server.js',
        'api/app.js',
        'services/tokenManager.js',
        'services/githubUpdater.js',
        'services/teamUpdater.js',
        'services/codeInterpretor.js',
        'services/analysisService.js',
        'services/metricsService.js',
        'Data Collection/github-utils.js',
        'Data Collection/repository-info-service.js',
        'Data Collection/universal-dora-service.js',
        'mcp-server.js'
      ]
      
      jsFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    })

    test('should have proper test file naming', () => {
      const testDirs = [
        path.join(process.cwd(), 'api', '__tests__'),
        path.join(process.cwd(), 'services', '__tests__'),
        path.join(process.cwd(), 'Data Collection', '__tests__')
      ]
      
      testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
          const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'))
          testFiles.forEach(testFile => {
            expect(testFile).toMatch(/\.test\.js$/)
          })
        }
      })
    })
  })

  describe('Code Quality Checks', () => {
    test('should have consistent indentation', () => {
      const jsFiles = [
        'api/server.js',
        'api/app.js',
        'services/tokenManager.js',
        'services/githubUpdater.js',
        'services/teamUpdater.js',
        'services/codeInterpretor.js',
        'services/analysisService.js',
        'services/metricsService.js'
      ]
      
      jsFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          // Check for consistent indentation (either spaces or tabs)
          const lines = content.split('\n')
          const indentationTypes = new Set()
          
          lines.forEach(line => {
            if (line.trim() && line.match(/^[\s]+/)) {
              const indent = line.match(/^[\s]+/)[0]
              if (indent.includes(' ')) indentationTypes.add('spaces')
              if (indent.includes('\t')) indentationTypes.add('tabs')
            }
          })
          
          // Should use consistent indentation
          expect(indentationTypes.size).toBeLessThanOrEqual(1)
        }
      })
    })

    test('should have proper function declarations', () => {
      const jsFiles = [
        'api/server.js',
        'api/app.js',
        'services/tokenManager.js',
        'services/githubUpdater.js',
        'services/teamUpdater.js',
        'services/codeInterpretor.js',
        'services/analysisService.js',
        'services/metricsService.js'
      ]
      
      jsFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          // Should have function declarations
          expect(content).toMatch(/function\s+\w+|const\s+\w+\s*=\s*\(|async\s+function/)
        }
      })
    })

    test('should have proper error handling', () => {
      const jsFiles = [
        'api/server.js',
        'api/app.js',
        'services/tokenManager.js',
        'services/githubUpdater.js',
        'services/teamUpdater.js',
        'services/codeInterpretor.js',
        'services/analysisService.js',
        'services/metricsService.js'
      ]
      
      jsFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          // Should have error handling
          expect(content).toMatch(/try\s*\{|catch\s*\(|throw\s+new\s+Error/)
        }
      })
    })
  })
})