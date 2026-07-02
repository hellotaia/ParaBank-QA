import { Locator, Page } from "@playwright/test";

export class NewsSection {
    readonly header: Locator;
    readonly newsItems: Locator;

    readonly atmServices: Locator;
    readonly atmServiceItems: Locator;
    readonly onlineServices: Locator;
    readonly onlineServiceItems: Locator;
    readonly latestNewsHeader: Locator;
    readonly latestNewsList: Locator;
    readonly newsDate: Locator;
    readonly latestNewsSection: Locator;


    constructor(page: Page) {
        this.header = page.locator("h2");
        this.newsDate = page.locator('ul.events li.captionthree');
        this.newsItems = page.locator(".news-item");
        this.latestNewsSection = page
            .locator('#rightPanel').locator('div').filter({
                has: page.locator('h4', { hasText: 'Latest News' }),
            });
        this.atmServices = page.locator('ul.services');
        this.atmServiceItems = page
            .locator('ul.services li:not(.captionone)');
        this.onlineServices = page.locator('ul.servicestwo');
        this.onlineServiceItems = page
            .locator('ul.servicestwo li:not(.captiontwo)');
        this.latestNewsHeader = page.locator('#rightPanel h4');
        this.latestNewsList = page.locator('ul.events');
    }
}