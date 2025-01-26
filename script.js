// Add this constant outside the class
const VIDEO_OEMBED_ENDPOINTS = {
  youtube: (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  vimeo: (url) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
  wistia: (url) => `https://fast.wistia.com/oembed?url=${encodeURIComponent(url)}&format=json`
};

class VideoThumbnailPreview {
    constructor(container) {
      this.container = container;
      this.input = container.querySelector('.video-input');
      this.thumbnailOutput = container.querySelector('.video-thumbnail-output');
      this.dataOutput = container.querySelector('.video-data-output');
      this.urlOutput = container.querySelector('.video-url-output');

      this.dataTitleOutput = container.querySelector('.video-data-title-output');
      this.dataHtmlOutput = container.querySelector('.video-data-html-output');
      this.dataHtmlRawOutput = container.querySelector('.video-data-html-raw-output');

      // Bind event listeners
      this.input.addEventListener('input', () => this.fetchThumbnail());
      
      // Initial fetch if there's a value
      this.fetchThumbnail();
    }
  
    async fetchThumbnail() {
      const url = this.input.value;
      if (!url) {
        this.clearOutput();
        return;
      }
  
      const videoProvider = this.detectVideoProvider(url);
      if (!videoProvider) {
        this.clearOutput();
        return;
      }
  
      try {
        const data = await this.fetchOembedData(url, videoProvider);
        if (data) {
          this.thumbnailOutput.innerHTML = `
            <figure>
              <img src="${data.thumbnail_url}" alt="${data.title}">
              <figcaption>${data.thumbnail_url}</figcaption>
            </figure>`;
          this.dataOutput.textContent = JSON.stringify(data, null, 2);
          this.urlOutput.textContent = VIDEO_OEMBED_ENDPOINTS[videoProvider](url);

          this.dataTitleOutput.textContent = data.title;
          this.dataHtmlOutput.innerHTML = data.html;
          this.dataHtmlRawOutput.textContent = data.html.replace(/\\"/g, '"');
        } else {
          this.clearOutput();
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
        this.clearOutput();
      }
    }
  
    clearOutput() {
      this.thumbnailOutput.innerHTML = '';
      this.dataOutput.innerHTML = '';
      this.urlOutput.textContent = '';
      this.dataTitleOutput.textContent = '';
      this.dataHtmlOutput.innerHTML = '';
      this.dataHtmlRawOutput.textContent = '';
    }
  
    detectVideoProvider(url) {
      if (url.match(/youtu/)) return 'youtube';
      if (url.match(/vimeo/)) return 'vimeo';
      if (url.match(/wistia/)) return 'wistia';
      return null;
    }
  
    async fetchOembedData(url, provider) {
      const endpointGenerator = VIDEO_OEMBED_ENDPOINTS[provider];
      if (!endpointGenerator) return null;
  
      const endpoint = endpointGenerator(url);
      const response = await fetch(endpoint);
      if (!response.ok) return null;
  
      const data = await response.json();
      return data;
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('video-preview-container');
    window.videoPreview = new VideoThumbnailPreview(container);
  });