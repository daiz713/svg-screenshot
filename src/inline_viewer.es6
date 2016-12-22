/**
 * ウェブページ中で SVG ScreenShot のプレビューを展開する
 * 対象画像をホバーしたときにSVGコンテンツを重ねて表示する
 */
  // TODO: 読み込み要求のボタンを設ける?
class InlineViewer {
  constructor () {
    this.appImg = 'https://svgscreenshot.appspot.com/c/c-';
    this.contentBaseUrl = 'https://svgscreenshot.appspot.com/c';
    this.bindEvents();
  }

  getScreenShotId (url='https://svgscreenshot.appspot.com/c/c-xxxx.png') {
    var cid = url.split(this.appImg)[1].split('.png')[0];
    return cid;
  }

  $getCover (cid='', $img) {
    var coverId = 'daiz-ss-iv-cover-c-' + cid;
    var pageX = window.pageXOffset;
    var pageY = window.pageYOffset;

    var $cover = $(`#${coverId}`);
    var newCover = false;

    // 存在しない場合は新規作成する
    if ($cover.length === 0) {
      newCover = true;
      $cover = $(`<div id="${coverId}" class="daiz-ss-iv-cover">
        <div class="daiz-ss-iv-svg">
        </div>
        <div class="daiz-ss-iv-cover-foot">
          <a href="#" class="svgss" target="_blank">SVG ScreenShot</a>
          <a href="#" class="jump" target="_blank">Original site</a>
        </div>
      </div>`);

      $cover.css({
        width: $img.width(),
        height: $img.height()
      });
    }

    var imgRect = $img[0].getBoundingClientRect();
    $cover.css({
        left: imgRect.left + pageX,
        top: imgRect.top + pageY
    });

    return [$cover, newCover];
  }

  // SVGコンテンツを表示する
  renderSVGScreenShot ($cover, cid='5735735550279680') {
    var cover = $cover[0];
    var coverWidth = $cover.width();
    var coverHeight = $cover.height();
    var $svgArea = $cover.find('.daiz-ss-iv-svg');
    var svgUrl = `${this.appImg}${cid}.svg`;
    $.ajax({
      url: svgUrl,
      dataType: "text"
    }).success(svgTag => {
      var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
      $svgArea[0].appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
      var svg = cover.querySelector('svg.svg-screenshot');
      var orgUrl = svg.getAttribute('data-url');
      var title = svg.getAttribute('data-title');
      var viewBox = svg.viewBox.baseVal;
      svg.setAttribute('width', viewBox.width);
      svg.setAttribute('height', viewBox.height);

      var handles = '';
      if ($cover.height() >= viewBox.height) {
        $svgArea.css('overflow-y', 'hidden');
      }else {
        $svgArea.css('overflow-y', 'auto');
      }
      if ($cover.width() >= viewBox.width) {
        $svgArea.css('overflow-x', 'hidden');
      }else {
        $svgArea.css('overflow-x', 'auto');
        handles = 'e';
      }

      // リサイズ可能にする
      if (handles.length > 0) {
        $cover.resizable({
          autoHide: true,
          handles: handles,
          minWidth: coverWidth,
          minHeight: coverHeight,
          start: () => {
            $cover.show();
          },
          resize: () => {
            $cover.show();
          }
        });
      }

      // cover footerを設定
      var $cFoot = $cover.find('.daiz-ss-iv-cover-foot');
      $cFoot.find('a.jump').attr('href', validateUrl(orgUrl));
      $cFoot.find('a.jump')[0].innerText = validateTitle(title);
      $cFoot.find('a.svgss').attr('href', `${this.contentBaseUrl}/${cid}`);
      $cFoot.show();
    });
  }

  bindEvents () {
    var self = this;
    var $body = $('body');

    // 画像mouseenter時
    $body.on('mouseenter', 'img', e => {
      var $img = $(e.target).closest('img');
      // 対象画像であるかを確認
      var src = $img.attr('src');
      if (src.startsWith(this.appImg)) {
        var cid = self.getScreenShotId(src);
        var coverInfo = self.$getCover(cid, $img);
        var $cover = coverInfo[0];
        if (coverInfo[1]) {
          // 新規作成されたカバー
          $body.append($cover);
          self.renderSVGScreenShot($cover, cid);
        }else {
          $cover.show();
        }
      }
    });

    // 画像mouseleave時
    $body.on('mouseleave', '.daiz-ss-iv-cover', e => {
      var $cover = $(e.target).closest('.daiz-ss-iv-cover');
      $cover.hide();
    });
  }
}