const fs = require("node:fs/promises");
const path = require("node:path");
const { Builder, By, until } = require("selenium-webdriver");

const baseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
const outputDir = path.resolve(__dirname, "artifacts");

async function waitForText(driver, text) {
  await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(normalize-space(), "${text}")]`)),
    10000,
    `Texto não encontrado: ${text}`,
  );
}

async function visitRoute(driver, route) {
  await driver.get(`${baseUrl}${route}`);
  await driver.wait(until.urlContains(route), 10000, `Rota não carregou: ${route}`);
}

async function login(driver, email) {
  await driver.manage().deleteAllCookies();
  await driver.get(`${baseUrl}/login`);
  await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  const emailField = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
  const passwordField = await driver.findElement(By.css('input[type="password"]'));
  await emailField.sendKeys(email);
  await passwordField.sendKeys(process.env.TEST_PASSWORD || "123456");
  await passwordField.sendKeys("\n");
  await driver.sleep(1500);
}

async function screenshot(driver, name) {
  await fs.writeFile(path.join(outputDir, `${name}.png`), await driver.takeScreenshot(), "base64");
}

async function run() {
  await fs.mkdir(outputDir, { recursive: true });
  let driver = await new Builder().forBrowser("chrome").build();
  const results = [];

  async function scenario(name, callback) {
    try {
      await callback();
      results.push({ name, status: "passed" });
    } catch (error) {
      results.push({ name, status: "failed", error: error.message });
      await screenshot(driver, `failure-${name}`);
    }
  }

  try {
    await scenario("public-page-and-menu", async () => {
      await driver.get(`${baseUrl}/mainPage`);
      await waitForText(driver, "FICHAS PRESENCIAIS");
      await screenshot(driver, "public-page");
    });

    await scenario("nutritionist-dashboard-and-menu", async () => {
      await login(driver, "nutri@local.test");
      await visitRoute(driver, "/painel-nutricionista");
      await visitRoute(driver, "/painel-nutricionista-cardapio");
      await screenshot(driver, "nutritionist-cardapios");
    });

    for (const [name, route] of [
      ["menu-cardapio-gerenciamento", "/painel-nutricionista-cardapio/gerenciar/2026-11-09"],
      ["menu-estoque", "/painel-nutricionista-estoque"],
      ["menu-mensagens", "/painel-nutricionista-mensagens"],
      ["menu-noticias", "/painel-nutricionista-noticias"],
      ["menu-perfil", "/meuPerfil"],
    ]) {
      await scenario(name, async () => {
        await visitRoute(driver, route);
        await screenshot(driver, name);
      });
    }

  } finally {
    await fs.writeFile(
      path.join(outputDir, "report.json"),
      `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
    );
    await driver.quit();
  }

  const failed = results.filter((result) => result.status === "failed");
  if (failed.length > 0) {
    throw new Error(`${failed.length} cenário(s) sistêmico(s) falharam.`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
