import {expect,test} from '@playwright/test';
test.use({launchOptions:process.env.APIOPS_TEST_BROWSER?{executablePath:process.env.APIOPS_TEST_BROWSER}:undefined});

test('people can select an edition, browse slides and reach matching downloads',async({page,request})=>{
  await page.goto('/presentations');
  await expect(page.getByRole('heading',{level:1})).toHaveText('APIOps Cycles presentations');
  await page.getByRole('heading',{name:'APIOps Cycles overview'}).getByRole('link').click();
  for(const label of ['Download PowerPoint','Download PDF','Download Reveal.js','Download source kit']){
    const link=page.getByRole('link',{name:new RegExp(label)});
    const response=await request.get((await link.getAttribute('href'))!);
    expect(response.status()).toBe(200);expect((await response.body()).length).toBeGreaterThan(1000);
  }
  await page.getByRole('link',{name:'View slides online'}).click();
  await expect(page.locator('[data-slide-status]')).toHaveText('Slide 1 of 8');
  await expect(page.getByRole('button',{name:'Previous slide',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Next slide',exact:true}).click();
  await expect(page.locator('[data-slide-status]')).toHaveText('Slide 2 of 8');
  await page.keyboard.press('ArrowRight');await expect(page.locator('[data-slide-status]')).toHaveText('Slide 3 of 8');
  await page.getByLabel('Choose a slide').selectOption('7');
  await expect(page.getByRole('button',{name:'Next slide',exact:true})).toBeDisabled();
  await expect(page.locator('[data-reveal-root] section.present')).toHaveCount(1);
  await expect(page.locator('[data-reveal-root] section.present .apiops-slide-text').first()).toBeVisible();
  await page.reload();await expect(page.locator('[data-slide-status]')).toHaveText('Slide 8 of 8');
  await page.getByText('Read text version of slide 8',{exact:true}).click();
  await expect(page.locator('[data-transcript="8"]').getByText('Lint, audit and share findings before the next release decision.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Slide overview'}).click();
  await expect(page.locator('[data-reveal-root]')).toHaveClass(/overview/);
  await page.keyboard.press('Escape');await expect(page.locator('[data-reveal-root]')).not.toHaveClass(/overview/);
});

test('library and technical transcript work on a narrow viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/presentations');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'.codex-artifacts/apiops-library/library-mobile.png',fullPage:true});
  await page.goto('/presentations/strategy-to-technical-delivery/view#slide-23');
  await expect(page.locator('[data-slide-status]')).toHaveText('Slide 23 of 28');
  await page.getByText('Read text version of slide 23',{exact:true}).click();
  await expect(page.locator('[data-transcript="23"]').getByText('npm run lint:openapi:full-crud',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'.codex-artifacts/apiops-library/viewer-mobile.png',fullPage:true});
});

test('slides, transcripts and downloads remain usable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
  await page.goto(new URL('/presentations/apiops-overview/view',baseURL).href);
  await expect(page.locator('[data-transcript]:visible')).toHaveCount(8);
  await expect(page.locator('[data-viewer-controls]')).toBeHidden();
  await page.getByText('Read text version of slide 8',{exact:true}).click();
  await expect(page.locator('[data-transcript="8"] ol')).toBeVisible();
  await context.close();
});

test('Reveal.js renders every edition as HTML and supports named links and fullscreen',async({page})=>{
  const failures:string[]=[];
  const layoutIssues:unknown[]=[];
  page.on('pageerror',error=>failures.push(error.message));
  for(const id of ['apiops-overview','financial-services-case-study','strategy-to-technical-delivery']){
    await page.goto(`/presentations/${id}/view#/slide-1`);
    await expect(page.locator('[data-presentation-viewer]')).toHaveAttribute('data-reveal-ready','true');
    const options=await page.locator('[data-slide-picker] option').count();
    for(let i=0;i<options;i++){
      await page.getByLabel('Choose a slide').selectOption(String(i));
      await expect(page.locator('[data-reveal-root] section.present')).toHaveAttribute('id',`slide-${i+1}`);
      await expect(page.locator('[data-transcript]:visible')).toHaveCount(1);
      const overflow=await page.locator('section.present .apiops-slide-item').evaluateAll(items=>items.filter(item=>item.tagName!=='IMG'&&item.scrollHeight>item.clientHeight+4).map(item=>({text:item.textContent?.slice(0,75),height:item.clientHeight,contentHeight:item.scrollHeight})));
      if(overflow.length)layoutIssues.push({id,slide:i+1,overflow});
    }
  }
  await page.getByRole('button',{name:'Enter fullscreen'}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('button',{name:'Exit fullscreen'}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(false);
  expect(failures).toEqual([]);
  await page.getByLabel('Choose a slide').selectOption('17');
  await expect(page.locator('[data-slide-status]')).toHaveText('Slide 18 of 28');
  await page.screenshot({path:'.codex-artifacts/apiops-library/reveal-desktop.png',fullPage:true});
  expect(layoutIssues,'all HTML slide content fits its layout').toEqual([]);
});

test('desktop library and deck detail render without broken images',async({page})=>{
  await page.goto('/presentations');
  await page.locator('.presentation-card img').last().scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('.presentation-card img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.screenshot({path:'.codex-artifacts/apiops-library/library-desktop.png',fullPage:true});
  await page.goto('/presentations/financial-services-case-study');
  await expect(page.locator('.presentation-cover img')).toBeVisible();
  await page.screenshot({path:'.codex-artifacts/apiops-library/detail-desktop.png',fullPage:true});
});

test('speaker view opens with the slide filling its receiver frame',async({page})=>{
  await page.goto('/presentations/apiops-overview/view#/slide-4');
  await expect(page.locator('[data-presentation-viewer]')).toHaveAttribute('data-reveal-ready','true');
  await page.locator('[data-reveal-root]').focus();
  const popupPromise=page.waitForEvent('popup');await page.keyboard.press('s');const popup=await popupPromise;
  await popup.waitForFunction(()=>document.body.innerText.toLowerCase().includes('time'));
  await expect.poll(()=>popup.frames().filter(frame=>frame.url().includes('receiver')).length).toBeGreaterThan(0);
  const frame=popup.frames().find(frame=>frame.url().includes('receiver'))!;
  await frame.waitForSelector('.presentation-speaker-receiver [data-reveal-ready]');
  expect(await frame.locator('[data-reveal-root]').evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(5);
  await popup.close();
});
