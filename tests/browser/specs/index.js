/**
 * tc for kissy swf
 * @author yiminghe@gmail.com, oicuicu@gmail.com
 */

var SWF = require('swf');
var Dom = require('dom');
var util = require('util');
var json = require('json');
var UA = require('ua');
var querystring = require('querystring');
function getFlashVars(swf) {
    if (Dom.nodeName(swf) === 'embed') {
        return querystring.parse(swf.getAttribute('flashvars'));
    } else {
        var params = swf.childNodes, i;
        for (i = 0; i < params.length; i++) {
            var param = params[i];
            if (param.nodeType === 1) {
                if (Dom.attr(params[i], 'name').toLowerCase() === 'flashvars') {
                    return querystring.parse(Dom.attr(param, 'value'));
                }
            }
        }
    }
}

if (UA.mobile || UA.phantomjs || location.protocol === 'file:') {

} else {
    describe('flash', function () {
        var defaultConfig = {
            attrs: {
                width: 310,
                height: 130,
                alt: 'KISSY Flash',
                title: 'O Yeah! KISSY Flash!'
            }
        };

        describe('flash player version', function () {
            it('should not less than 9', function () {
                expect(SWF.fpv().length).to.be(3);
                expect(SWF.fpvGTE(9)).to.ok();
                expect(SWF.fpvGTE(9.0)).to.ok();
                expect(SWF.fpvGTE('9')).to.ok();
                expect(SWF.fpvGTE('9.0.16')).to.ok();
                expect(SWF.fpvGTE('9.0 r16')).to.ok();
                expect(SWF.fpvGTE(['9', '0', '16'])).to.ok();
            });
        });

        describe('create', function () {
            it('can create into body', function () {
                var swf1 = new SWF({
                    src: '/tests/browser/specs/test.swf',
                    attrs: {
                        id: 'test',
                        width: 300,
                        height: 300
                    },
                    params: {
                        bgcolor: '#d55867'
                    }
                });

                expect(swf1.get('status')).to.be(SWF.Status.SUCCESS);

                expect(Dom.last(document.body)).to.be(swf1.get('swfObject'));
                expect(swf1.get('swfObject').nodeName.toLowerCase()).to.be('object');
                // has id
                expect(swf1.get('html').replace('classid', '').indexOf('id=')).to.above(-1);
                expect(swf1.get('el').id).to.be('test');

                swf1.destroy();
                waits(300);
                runs(function () {
                    expect(Dom.contains(document, swf1.get('swfObject'))).to.be(false);
                });
            });

            it('can specify existing container', function () {
                var render = Dom.create('<div class="test"></div>');
                Dom.prepend(render, document.body);
                var swf1 = new SWF({
                    src: '/tests/browser/specs/test.swf',
                    render: render,
                    attrs: {
                        width: 300,
                        height: 300
                    },
                    params: {
                        bgcolor: '#d55867'
                    }
                });

                expect(swf1.get('status')).to.be(SWF.Status.SUCCESS);

                expect(Dom.hasClass(swf1.get('swfObject').parentNode, 'test')).to.be(true);

                expect(Dom.first(document.body)).to.be(render);
                expect(render.innerHTML.toLowerCase().indexOf('object')).to.above(0);

                // has id
                expect(swf1.get('html').replace('classid', '').indexOf('id=')).to.above(-1);
                expect(Dom.hasAttr(swf1.get('el'), 'id')).to.be(true);

                swf1.destroy();
                waits(300);
                runs(function () {
                    expect(render.innerHTML.toLowerCase()).to.be('');
                });
            });

            it('ok with flashvars', function () {
                var config = util.merge(util.clone(defaultConfig), {
                    src: '/tests/browser/specs/flashvars.swf',
                    params: {
                        bgcolor: '#038C3C',
                        flashvars: {
                            name1: 'http://taobao.com/?x=1&z=2',
                            name2: json.stringify({
                                s: 'string',
                                b: false,
                                n: 1,
                                url: 'http://taobao.com/?x=1&z=2',
                                cpx: {
                                    s: 'string',
                                    b: false,
                                    n: 1,
                                    url: 'http://taobao.com/?x=1&z=2'
                                }
                            }),
                            name3: 'string'
                        }
                    },
                    attrs: {
                        id: 'test-flash-vars'
                    }
                });

                var swf = new SWF(config);
                var flashvars = getFlashVars(swf.get('el'));
                expect(flashvars.name1).to.be('http://taobao.com/?x=1&z=2');
                expect(util.parseJson(flashvars.name2).cpx.s).to.be('string');
                expect(swf.get('el').id).to.be('test-flash-vars');

                swf.destroy();

                waits(1000);
            });

            it('will handle low version', function () {
                var swf1 = new SWF({
                    src: '/tests/browser/specs/test.swf',
                    attrs: {
                        width: 300,
                        height: 300
                    },
                    params: {
                        // only allow hex
                        bgcolor: '#d55867'
                    },
                    version: '99'
                });

                expect(swf1.get('status')).to.be(SWF.Status.TOO_LOW);
                expect(SWF.getSrc(swf1.get('el')).indexOf('swf/expressInstall.swf')).not.to.be(-1);
            });
        });
    });
}
