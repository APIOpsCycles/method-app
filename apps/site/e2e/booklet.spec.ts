import {expect,test} from '@playwright/test';

test.use({launchOptions:process.env.APIOPS_TEST_BROWSER?{executablePath:process.env.APIOPS_TEST_BROWSER}:undefined});

test('the A5 booklet is discoverable in presentations with usable downloads',async({page,request},testInfo)=>{
  await page.goto('/presentations');
  await page.getByRole('heading',{name:'Turning ideas into reusable capabilities',exact:true}).getByRole('link').click();
  await expect(page).toHaveURL(/\/presentations\/capabilities-booklet\/?$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Turning ideas into reusable capabilities');
  for(const [label,signature] of [['Download PDF','%PDF'],['Download print PDF','%PDF'],['Download PowerPoint','PK']]){
    const href=await page.getByRole('link',{name:label,exact:true}).getAttribute('href');
    const response=await request.get(href!);
    expect(response.ok()).toBe(true);
    expect((await response.body()).subarray(0,signature.length).toString()).toBe(signature);
  }
  const cover=page.getByRole('img',{name:'Cover of Turning ideas into reusable capabilities'});
  expect(await cover.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('booklet-mobile.png'),fullPage:true});
  await page.getByRole('link',{name:'Read booklet online',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Turning ideas into reusable capabilities');
  await expect(page.locator('main section')).toHaveCount(12);
  expect((await request.get('/sitemap.xml')).ok()).toBe(true);
});

test('the booklet remains discoverable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${baseURL}/presentations`);
  await page.getByRole('heading',{name:'Turning ideas into reusable capabilities',exact:true}).getByRole('link').click();
  await expect(page.getByRole('link',{name:'Download print PDF',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Read booklet online',exact:true}).click();
  await expect(page.locator('main section')).toHaveCount(12);
  await context.close();
});
