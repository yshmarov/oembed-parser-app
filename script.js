class VideoThumbnailPreview {
    constructor(container) {
      this.container = container;
      this.input = container.querySelector('.video-input');
      this.thumbnailOutput = container.querySelector('.video-thumbnail-output');
      this.dataOutput = container.querySelector('.video-data-output');
      this.urlOutput = container.querySelector('.video-url-output');
      
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
          this.thumbnailOutput.innerHTML = `<img src="${data.thumbnail_url}" alt="Video thumbnail">`;
          this.dataOutput.textContent = JSON.stringify(data, null, 2);
          this.urlOutput.textContent = url;
        } else {
          this.clearOutput();
        }
      } catch (error) {
        this.clearOutput();
      }
    }
  
    clearOutput() {
      this.thumbnailOutput.innerHTML = '';
      this.dataOutput.innerHTML = '';
    }
  
    detectVideoProvider(url) {
      if (url.match(/youtu/)) return 'youtube';
      if (url.match(/vimeo/)) return 'vimeo';
      if (url.match(/wistia/)) return 'wistia';
      return null;
    }
  
    async fetchOembedData(url, provider) {
      const endpoints = {
        youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        wistia: `https://fast.wistia.com/oembed?url=${encodeURIComponent(url)}&format=json`
      };
  
      const endpoint = endpoints[provider];
      if (!endpoint) return null;
  
      const response = await fetch(endpoint);
      if (!response.ok) return null;
  
      const data = await response.json();
      return data;
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#video-preview-container');
    window.videoPreview = new VideoThumbnailPreview(container);
  });