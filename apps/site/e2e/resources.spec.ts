import {expect,test} from '@playwright/test';
test.use({launchOptions:process.env.APIOPS_TEST_BROWSER?{executablePath:process.env.APIOPS_TEST_BROWSER}:undefined});

test('find a tool, understand its context and open the correct workspace',async({page,request})=>{
 await page.goto('/resources',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{level:1})).toHaveText('Practical tools');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(30);
 await page.getByRole('searchbox',{name:'Search tools'}).fill('Customer Journey');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(2);
 const entry=page.locator('[data-resource]').filter({has:page.getByRole('heading',{name:'Customer Journey Canvas',exact:true})});
 await expect(entry).toContainText('What journey does the most external meaningful customer experience');
 for(const cycle of ['Capability Productization Cycle','API Productization Cycle','Integration Productization Cycle','Automation Cycle'])await expect(entry.getByRole('link',{name:cycle,exact:true})).toBeVisible();
 const href=await entry.getByRole('link',{name:'Purpose and instructions'}).getAttribute('href');
 expect((await request.get(href!)).status()).toBe(200);
 const workspace=new URL((await entry.getByRole('link',{name:'Open canvas'}).getAttribute('href'))!);
 expect(workspace.hostname).toBe('canvascreator.apiopscycles.com');
 expect(workspace.searchParams.get('canvas')).toBe('customerJourneyCanvas');
 await page.getByLabel('Cycle',{exact:true}).selectOption('automation-cycle');
 await expect(entry).toContainText('Customer Journey Canvas');
 await page.getByLabel('Tool type').selectOption('checklist');
 await expect(page.locator('[data-resource-empty]')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(30);
 await page.getByLabel('Tool type').selectOption('checklist');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await expect(page.locator('[data-resource]:visible')).toContainText('API Audit Checklist');
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
});

test('tool directory is readable without JavaScript and indexed in every locale',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();await page.goto('/resources',{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-resource]')).toHaveCount(30);
 await expect(page.getByRole('heading',{name:'Customer Journey Canvas',exact:true})).toBeVisible();
 await context.close();
 const sitemap=await(await request.get('/sitemap.xml')).text();
 for(const prefix of ['','/fi','/fr','/de','/pt']){
  const response=await request.get(prefix+'/resources');expect(response.status()).toBe(200);
  expect(await response.text()).toContain('data-resource');
  expect(sitemap).toContain(prefix+'/resources');
 }
 expect((await request.get('/resources.md')).status()).toBe(200);
});

test('tool discovery works on a narrow viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/resources?q=Customer+Journey',{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-resource]:visible')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'tempfiles/resources-mobile.png',fullPage:true});
});
