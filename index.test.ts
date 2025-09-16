import {Locator, webkit, test, expect} from 'playwright/test'
import { compare } from 'odiff-bin';

const hideSection = async (section: Locator) => {
  await section.evaluate((div: HTMLElement) => {
    div.style.display = 'none';
  });
}

const showSection = async (section: Locator) => {
  await section.evaluate((div: HTMLElement) => {
    div.style.display = 'block';
  });
}

const hideAllSections = async (sections: Locator[]) => {
  for (const section of sections){
    await hideSection(section);
  }
}

const showAllSections = async (sections: Locator[]) => {
  for (const section of sections){
    await showSection(section);
  }
}

const generateSnapshot = async (url:string, directoryOutput:string = 'result') => {
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: "networkidle"});
  await context.clearCookies();
  await context.clearCookies({ domain: '127.0.0.1:3000' });
  await context.clearCookies({ domain: 'incentro.com' });

  // hide cookie dialog
  const cookieDialog: Locator = page.locator('div.ch2.ch2-region-g0');
  await hideSection(cookieDialog);

  // hide next.js static indicator
  const nextstaticindicator: Locator = page.locator('div.nextjs-toast.nextjs-static-indicator-toast-wrapper');
  
  if (await nextstaticindicator.isVisible()){
    await hideSection(nextstaticindicator);
  } 

  const sections = [
    ...await page.locator('header').all(),
    ...await page.locator('section').all(),
    ...await page.locator('footer').all(),
  ];

  const snapshotRecords: string[] = [];

  for (const [index, section] of sections.entries()){
    await hideAllSections(sections); 

    await section.evaluate((div: HTMLElement) => {
      div.style.display = 'block';
    })

    const snapshotRecord = `${directoryOutput}/image-${index}.png`;
    await section.screenshot({ path: snapshotRecord}).then(() => {
      snapshotRecords.push(snapshotRecord);
    });

    await showAllSections(sections);
  } 

  await browser.close();
  
  return snapshotRecords;
}


const main = async () => {
  const sourceSnapshotRecords = await generateSnapshot('http://localhost:3000/en-NL', 'source');
  const targetSnapshotRecords = await generateSnapshot('https://incentro.com/en-NL', 'target');

  expect(targetSnapshotRecords.length).toBe(sourceSnapshotRecords.length);

  let totalDifference = 0;

  for (let index = 0; index < Math.min(sourceSnapshotRecords.length, targetSnapshotRecords.length); index++) {
    const { match } = await compare(
      sourceSnapshotRecords[index],
      targetSnapshotRecords[index],
      `result/image-${index}.png`
    )

    console.info(`Comparation Status [${match}]`);
    
    if(!match){
      totalDifference++;
    }
  }

  expect(totalDifference).toBeLessThanOrEqual(1);
}

test('visual regression test', main);