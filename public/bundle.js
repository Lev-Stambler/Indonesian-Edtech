
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/players/MainPlayer.svelte generated by Svelte v3.6.9 */

    const file = "src/components/players/MainPlayer.svelte";

    function create_fragment(ctx) {
    	var img;

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "src", "static/chars/Diah.png");
    			attr(img, "alt", ctx.charName);
    			attr(img, "class", "svelte-17rtt07");
    			add_location(img, file, 11, 0, 180);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const charName = "Diah";

    	return { charName };
    }

    class MainPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["charName"]);
    	}

    	get charName() {
    		return this.$$.ctx.charName;
    	}

    	set charName(value) {
    		throw new Error("<MainPlayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/speech/Speechbox.svelte generated by Svelte v3.6.9 */

    const file$1 = "src/components/speech/Speechbox.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.word = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (30:4) {#each text.replace(/[\n\r]/g, '').split(' ') as word, index}
    function create_each_block(ctx) {
    	var div, t0_value = ctx.word.trim(), t0, t1;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" \n      ");
    			div.dataset.aos = "flip-left";
    			set_style(div, "display", "inline-block");
    			div.dataset.aosDelay = ctx.index * 50;
    			add_location(div, file$1, 30, 6, 653);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.text) && t0_value !== (t0_value = ctx.word.trim())) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div1, div0, t0, t1, p;

    	var each_value = ctx.text.replace(/[\n\r]/g, '').split(' ');

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(ctx.speaker);
    			t1 = space();
    			p = element("p");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "speaker svelte-1et78d9");
    			add_location(div0, file$1, 27, 2, 538);
    			attr(p, "class", "svelte-1et78d9");
    			add_location(p, file$1, 28, 2, 577);
    			attr(div1, "class", "box svelte-1et78d9");
    			add_location(div1, file$1, 26, 0, 518);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div1, t1);
    			append(div1, p);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.speaker) {
    				set_data(t0, ctx.speaker);
    			}

    			if (changed.text) {
    				each_value = ctx.text.replace(/[\n\r]/g, '').split(' ');

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { text, speaker } = $$props;

    	const writable_props = ['text', 'speaker'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Speechbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('speaker' in $$props) $$invalidate('speaker', speaker = $$props.speaker);
    	};

    	return { text, speaker };
    }

    class Speechbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["text", "speaker"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.text === undefined && !('text' in props)) {
    			console.warn("<Speechbox> was created without expected prop 'text'");
    		}
    		if (ctx.speaker === undefined && !('speaker' in props)) {
    			console.warn("<Speechbox> was created without expected prop 'speaker'");
    		}
    	}

    	get text() {
    		throw new Error("<Speechbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Speechbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get speaker() {
    		throw new Error("<Speechbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set speaker(value) {
    		throw new Error("<Speechbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/templates/PersonLeft.svelte generated by Svelte v3.6.9 */

    const file$2 = "src/templates/PersonLeft.svelte";

    function create_fragment$2(ctx) {
    	var img, img_src_value, t0, div0, updating_charName, t1, div1, div1_style_value, current;

    	function character_charName_binding(value) {
    		ctx.character_charName_binding.call(null, value);
    		updating_charName = true;
    		add_flush_callback(() => updating_charName = false);
    	}

    	let character_props = {};
    	if (ctx.charName !== void 0) {
    		character_props.charName = ctx.charName;
    	}
    	var character = new ctx.Character({ props: character_props, $$inline: true });

    	binding_callbacks.push(() => bind(character, 'charName', character_charName_binding));

    	var speechbox = new Speechbox({
    		props: { speaker: ctx.charName, text: ctx.text },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			character.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			speechbox.$$.fragment.c();
    			attr(img, "src", img_src_value = "static/bckgrnds/" + ctx.backgroundSrc);
    			attr(img, "alt", "");
    			attr(img, "class", "background");
    			add_location(img, file$2, 25, 0, 463);
    			attr(div0, "class", "charactercontainer svelte-1r4tuws");
    			add_location(div0, file$2, 26, 0, 533);
    			attr(div1, "class", "speechcontainer svelte-1r4tuws");
    			attr(div1, "style", div1_style_value = ctx.top ? 'top: 5%; left: 25%; right: 15%;' : '');
    			add_location(div1, file$2, 29, 0, 603);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t0, anchor);
    			insert(target, div0, anchor);
    			mount_component(character, div0, null);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			mount_component(speechbox, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.backgroundSrc) && img_src_value !== (img_src_value = "static/bckgrnds/" + ctx.backgroundSrc)) {
    				attr(img, "src", img_src_value);
    			}

    			var character_changes = {};
    			if (!updating_charName && changed.charName) {
    				character_changes.charName = ctx.charName;
    			}
    			character.$set(character_changes);

    			var speechbox_changes = {};
    			if (changed.charName) speechbox_changes.speaker = ctx.charName;
    			if (changed.text) speechbox_changes.text = ctx.text;
    			speechbox.$set(speechbox_changes);

    			if ((!current || changed.top) && div1_style_value !== (div1_style_value = ctx.top ? 'top: 5%; left: 25%; right: 15%;' : '')) {
    				attr(div1, "style", div1_style_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(character.$$.fragment, local);

    			transition_in(speechbox.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(character.$$.fragment, local);
    			transition_out(speechbox.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    				detach(t0);
    				detach(div0);
    			}

    			destroy_component(character);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			destroy_component(speechbox);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { text = '', Character = '', charName = '', backgroundSrc = '', top = false } = $$props;

    	const writable_props = ['text', 'Character', 'charName', 'backgroundSrc', 'top'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PersonLeft> was created with unknown prop '${key}'`);
    	});

    	function character_charName_binding(value) {
    		charName = value;
    		$$invalidate('charName', charName);
    	}

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('Character' in $$props) $$invalidate('Character', Character = $$props.Character);
    		if ('charName' in $$props) $$invalidate('charName', charName = $$props.charName);
    		if ('backgroundSrc' in $$props) $$invalidate('backgroundSrc', backgroundSrc = $$props.backgroundSrc);
    		if ('top' in $$props) $$invalidate('top', top = $$props.top);
    	};

    	return {
    		text,
    		Character,
    		charName,
    		backgroundSrc,
    		top,
    		character_charName_binding
    	};
    }

    class PersonLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["text", "Character", "charName", "backgroundSrc", "top"]);
    	}

    	get text() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Character() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Character(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charName() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charName(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundSrc() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundSrc(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/templates/Initial.svelte generated by Svelte v3.6.9 */

    const file$3 = "src/templates/Initial.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.word = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (36:6) {#each header.replace(/[\n\r]/g, '').split(' ') as word, index}
    function create_each_block$1(ctx) {
    	var div, t0_value = ctx.word.trim(), t0, t1;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" \n        ");
    			div.dataset.aos = "fade-up";
    			set_style(div, "display", "inline-block");
    			div.dataset.aosDelay = ctx.index * 50;
    			add_location(div, file$3, 36, 8, 786);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.header) && t0_value !== (t0_value = ctx.word.trim())) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var img, img_src_value, t0, div1, div0, h1, t1, p, t2;

    	var each_value = ctx.header.replace(/[\n\r]/g, '').split(' ');

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			p = element("p");
    			t2 = text(ctx.subtext);
    			attr(img, "src", img_src_value = "static/bckgrnds/" + ctx.backgroundSrc);
    			attr(img, "alt", "");
    			attr(img, "class", "background");
    			add_location(img, file$3, 31, 0, 582);
    			attr(h1, "class", "svelte-av3lrp");
    			add_location(h1, file$3, 34, 4, 703);
    			p.dataset.aos = "fade-left";
    			p.dataset.aosDelay = "300";
    			attr(p, "class", "svelte-av3lrp");
    			add_location(p, file$3, 41, 4, 945);
    			attr(div0, "class", "transpar svelte-av3lrp");
    			add_location(div0, file$3, 33, 2, 676);
    			attr(div1, "class", "wrapper svelte-av3lrp");
    			add_location(div1, file$3, 32, 0, 652);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t0, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(h1, null);
    			}

    			append(div0, t1);
    			append(div0, p);
    			append(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.backgroundSrc) && img_src_value !== (img_src_value = "static/bckgrnds/" + ctx.backgroundSrc)) {
    				attr(img, "src", img_src_value);
    			}

    			if (changed.header) {
    				each_value = ctx.header.replace(/[\n\r]/g, '').split(' ');

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(h1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.subtext) {
    				set_data(t2, ctx.subtext);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    				detach(t0);
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { backgroundSrc = "CityNight.jpg", header = "Welcome", subtext = "Welcome" } = $$props;

    	const writable_props = ['backgroundSrc', 'header', 'subtext'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Initial> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('backgroundSrc' in $$props) $$invalidate('backgroundSrc', backgroundSrc = $$props.backgroundSrc);
    		if ('header' in $$props) $$invalidate('header', header = $$props.header);
    		if ('subtext' in $$props) $$invalidate('subtext', subtext = $$props.subtext);
    	};

    	return { backgroundSrc, header, subtext };
    }

    class Initial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["backgroundSrc", "header", "subtext"]);
    	}

    	get backgroundSrc() {
    		throw new Error("<Initial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundSrc(value) {
    		throw new Error("<Initial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Initial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Initial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtext() {
    		throw new Error("<Initial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtext(value) {
    		throw new Error("<Initial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    console.log(PersonLeft);

    var levelOne = [
      { 
        template: Initial,
        opts: { subtext: 'Click next to start', header: 'Learn to code and explore Indonesia!' }
      },
      {
        template: PersonLeft,
        opts: { 
          text: `Hi! My name is Diah, and this is my hometown of Jakarta! 
Jakarta is the largest city in Indonesia, and also its capital! Over 10 million people live here! 
There are so many people who come to here for opportunities in business and education!`,
          Character: MainPlayer,
          backgroundSrc: "CityNight.jpg"
        }
      },
      {
        template: PersonLeft,
        opts: {
          Character: MainPlayer,
          text: `I am on a mission to explore other parts of my beautiful country. Why don’t you come along?`,
          backgroundSrc: "CityNight.jpg"
        }
      },
      {
        template: PersonLeft,
        opts: {
          Character: MainPlayer,
          text: `The first stop on our journey will be Magelang! This city is home to the Borobudur Temple, the world’s biggest Buddhist Temple!`,
          backgroundSrc: "BorbMap.png",
          top: true
        }
      },
      {
        template: PersonLeft,
        opts: {
          Character: MainPlayer,
          text: `Let’s stop by and explore what it’s like!`,
          backgroundSrc: "BorbMap.png",
          top: true
        }
      }
    ];

    /* src/templates/CodeRender.svelte generated by Svelte v3.6.9 */

    const file$4 = "src/templates/CodeRender.svelte";

    // (92:2) {#if text}
    function create_if_block(ctx) {
    	var p, t0, t1;

    	var if_block = (ctx.challengeText) && create_if_block_1(ctx);

    	return {
    		c: function create() {
    			p = element("p");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(ctx.text);
    			attr(p, "class", "svelte-asj80w");
    			add_location(p, file$4, 92, 4, 1986);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			if (if_block) if_block.m(p, null);
    			append(p, t0);
    			append(p, t1);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.challengeText) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(p, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.text) {
    				set_data(t1, ctx.text);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    // (94:4) {#if challengeText}
    function create_if_block_1(ctx) {
    	var h3, t;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			t = text(ctx.challengeText);
    			attr(h3, "class", "svelte-asj80w");
    			add_location(h3, file$4, 94, 7, 2021);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    			append(h3, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.challengeText) {
    				set_data(t, ctx.challengeText);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div6, t0, div2, div0, t2, div1, t4, div5, div3, textarea, t5, div4, dispose;

    	var if_block = (ctx.text) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div6 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Edit your code:";
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "See your code";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			textarea = element("textarea");
    			t5 = space();
    			div4 = element("div");
    			attr(div0, "class", "svelte-asj80w");
    			add_location(div0, file$4, 100, 4, 2170);
    			attr(div1, "class", "svelte-asj80w");
    			add_location(div1, file$4, 101, 4, 2201);
    			attr(div2, "class", "top-container svelte-asj80w");
    			set_style(div2, "display", "flex");
    			set_style(div2, "color", "white");
    			set_style(div2, "width", "100%");
    			add_location(div2, file$4, 99, 2, 2088);
    			attr(textarea, "name", "");
    			attr(textarea, "id", "");
    			attr(textarea, "cols", "400");
    			attr(textarea, "rows", "10");
    			set_style(textarea, "width", "100%");
    			set_style(textarea, "height", "100%");
    			attr(textarea, "class", "svelte-asj80w");
    			add_location(textarea, file$4, 105, 6, 2323);
    			attr(div3, "class", "editSpot elem textarea-wrapper svelte-asj80w");
    			add_location(div3, file$4, 104, 4, 2272);
    			attr(div4, "class", "renderSpot elem svelte-asj80w");
    			add_location(div4, file$4, 107, 4, 2480);
    			attr(div5, "class", "editor-container svelte-asj80w");
    			add_location(div5, file$4, 103, 2, 2237);
    			attr(div6, "class", "container svelte-asj80w");
    			add_location(div6, file$4, 90, 0, 1945);

    			dispose = [
    				listen(textarea, "input", ctx.textarea_input_handler),
    				listen(textarea, "keydown", allowTab)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			if (if_block) if_block.m(div6, null);
    			append(div6, t0);
    			append(div6, div2);
    			append(div2, div0);
    			append(div2, t2);
    			append(div2, div1);
    			append(div6, t4);
    			append(div6, div5);
    			append(div5, div3);
    			append(div3, textarea);

    			textarea.value = ctx.htmlRender;

    			append(div5, t5);
    			append(div5, div4);
    			div4.innerHTML = ctx.htmlRender;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.text) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div6, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.htmlRender) textarea.value = ctx.htmlRender;

    			if (changed.htmlRender) {
    				div4.innerHTML = ctx.htmlRender;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function allowTab(e) {
      if(e.keyCode==9 || e.which==9){
        e.preventDefault();
        let s = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
        this.selectionEnd = s+1; 
      }
    }

    function instance$4($$self, $$props, $$invalidate) {
    	// localStorage.setItem('user', JSON.stringify(user));

    // Then to retrieve it from the store and convert to an object again:

    // let user = JSON.parse(localStorage.getItem('user'));

    // If we need to delete all entries of the store we can simply do:

    // localStorage.clear();

      let textareas = document.getElementsByTagName('textarea');
      let count = textareas.length;

      let { htmlRender = "", text = false, challengeText = false } = $$props;

    	const writable_props = ['htmlRender', 'text', 'challengeText'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<CodeRender> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		htmlRender = this.value;
    		$$invalidate('htmlRender', htmlRender);
    	}

    	$$self.$set = $$props => {
    		if ('htmlRender' in $$props) $$invalidate('htmlRender', htmlRender = $$props.htmlRender);
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('challengeText' in $$props) $$invalidate('challengeText', challengeText = $$props.challengeText);
    	};

    	return {
    		htmlRender,
    		text,
    		challengeText,
    		textarea_input_handler
    	};
    }

    class CodeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["htmlRender", "text", "challengeText"]);
    	}

    	get htmlRender() {
    		throw new Error("<CodeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set htmlRender(value) {
    		throw new Error("<CodeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<CodeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<CodeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get challengeText() {
    		throw new Error("<CodeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set challengeText(value) {
    		throw new Error("<CodeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/templates/Video.svelte generated by Svelte v3.6.9 */

    const file$5 = "src/templates/Video.svelte";

    function create_fragment$5(ctx) {
    	var div, p, t0, t1, video, source;

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(ctx.text);
    			t1 = space();
    			video = element("video");
    			source = element("source");
    			add_location(p, file$5, 1, 2, 26);
    			attr(source, "src", ctx.vidSrc);
    			attr(source, "type", "video/mp4");
    			add_location(source, file$5, 5, 4, 102);
    			attr(video, "src", ctx.vidSrc);
    			attr(video, "height", "600");
    			attr(video, "width", "800");
    			add_location(video, file$5, 4, 2, 50);
    			attr(div, "class", "container svelte-1kk3kvq");
    			add_location(div, file$5, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(div, t1);
    			append(div, video);
    			append(video, source);
    		},

    		p: function update(changed, ctx) {
    			if (changed.text) {
    				set_data(t0, ctx.text);
    			}

    			if (changed.vidSrc) {
    				attr(source, "src", ctx.vidSrc);
    				attr(video, "src", ctx.vidSrc);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { vidSrc = false, text = '' } = $$props;

    	const writable_props = ['vidSrc', 'text'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('vidSrc' in $$props) $$invalidate('vidSrc', vidSrc = $$props.vidSrc);
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    	};

    	return { vidSrc, text };
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["vidSrc", "text"]);
    	}

    	get vidSrc() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vidSrc(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    console.log(PersonLeft);

    var levelTwo = [
      { 
        template: Initial,
        opts: { subtext: 'Click next to start level one', header: 'Now, the real work begins, let\'s learn some HTML' }
      },
      {
        template: PersonLeft,
        opts: { 
          text: `Welcome to Yogakarta, home to the Borobudur temple. This temple has been around since the 9th century (1200 years ago) and has survived many volcanic eruptions, terrorist bombings and even earthquakes!`,
          Character: MainPlayer,
          backgroundSrc: "Borb.png"
        }
      },
      {
        template: PersonLeft,
        opts: {
          Character: MainPlayer,
          text: `This temple is being rebuilt by this team of monks. To get to the next level, you have to help them. Click Next to learn how.`,
          backgroundSrc: "Borb.png"
        }
      },
      {
        template: Video,
        opts: { 
          text: `It's advised that you take notes; but, do not worry. You can always come back and rewatch the video!`,
          vidSrc: "https://images.bonanzastatic.com/uploads/burnees/7eqg-0001-3554625-1565824062.jpg"
        }
      },
      {
        template: CodeRender,
        opts: {
          text: `Take a second to practice your new found skills. Try to make a header (h1) tag and a paragraph tag (p1)`,
        }
      },
      {
        template: CodeRender,
        opts: {
          challengeText: 'The Monks have a challenge!',
          text: `The monks need to create a flier to alert the members of the temple to sign up to help. Create the basic skeleton of this html page using what you just learned.`
        }
      },
      {
        template: PersonLeft,
        opts: {
          Character: MainPlayer,
          text: `Next stop is Bogor, where we have the Bogor Botanical gardens.`,
          backgroundSrc: "MapNext.png",
          top: true
        }
      }
    ];

    var levels = [
      levelOne,
      levelTwo
    ];

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/App.svelte generated by Svelte v3.6.9 */

    const file$6 = "src/App.svelte";

    // (96:0) {#if mainVis}
    function create_if_block$1(ctx) {
    	var div, current;

    	var currentcomponent_spread_levels = [
    		ctx.CurrentScreen.opts
    	];

    	let currentcomponent_props = {};
    	for (var i = 0; i < currentcomponent_spread_levels.length; i += 1) {
    		currentcomponent_props = assign(currentcomponent_props, currentcomponent_spread_levels[i]);
    	}
    	var currentcomponent = new ctx.CurrentComponent({
    		props: currentcomponent_props,
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			currentcomponent.$$.fragment.c();
    			attr(div, "class", "main-content svelte-1at3n9h");
    			add_location(div, file$6, 96, 0, 2614);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(currentcomponent, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var currentcomponent_changes = changed.CurrentScreen ? get_spread_update(currentcomponent_spread_levels, [
    				ctx.CurrentScreen.opts
    			]) : {};
    			currentcomponent.$set(currentcomponent_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(currentcomponent.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(currentcomponent.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(currentcomponent);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div, button0, t0, button1, t1, if_block_anchor, current, dispose;

    	var if_block = (ctx.mainVis) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(button0, "class", "back svelte-1at3n9h");
    			add_location(button0, file$6, 92, 1, 2458);
    			attr(button1, "class", "next svelte-1at3n9h");
    			add_location(button1, file$6, 93, 1, 2526);
    			attr(div, "class", "direction-selection svelte-1at3n9h");
    			add_location(div, file$6, 91, 0, 2423);

    			dispose = [
    				listen(button0, "click", ctx.click_handler),
    				listen(button1, "click", ctx.click_handler_1)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(div, t0);
    			append(div, button1);
    			insert(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.mainVis) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    				detach(t1);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	
    	let { name } = $$props;
    	let mainVis = true;
    	let currentLevel = 0;
    	let currentSublevel = 0;
    	let { CurrentScreen, CurrentComponent } = $$props;
    	const _CurrentScreen = writable();
    	const _CurrentComponent = writable();
    	setCurrentOnLoad();
    	_CurrentScreen.subscribe(val => { $$invalidate('CurrentScreen', CurrentScreen = val); });
    	_CurrentComponent.subscribe(val => { $$invalidate('CurrentComponent', CurrentComponent = val); });
    	function setCurrentOnLoad() {
    		const url = window.location.href;
    		if (url.indexOf("#") !== -1) {
    			const levelMap = url.split("#")[1];
    			currentLevel = levelMap.split('/')[0] || 0;
    			currentSublevel = levelMap.split('/')[1] || 0;
    		}
    		setScreen();
    	}
    	function incrementStage() {
    		currentSublevel++;		if (currentSublevel >= levels[currentLevel].length && currentLevel + 1 < levels.length) {
    			currentSublevel = 0;
    			currentLevel++;		} else if(currentSublevel >= levels[currentLevel].length) {
    			currentSublevel--;		}
    		setScreen();
    	}
    	function decrementStage() {
    		currentSublevel--;		if (currentSublevel < 0) {
    			currentLevel = currentLevel > 0 ? currentLevel - 1 : 0;
    			currentSublevel = currentLevel >= 0 ? levels[currentLevel].length - 1 : currentSublevel--;			currentSublevel = currentSublevel >= 0 ? currentSublevel : 0;
    		}
    		setScreen();
    	}

    	function setScreen() {
    		window.location.hash = currentLevel + "/" + currentSublevel;
    		$$invalidate('mainVis', mainVis = false);
    		_CurrentScreen.set(levels[currentLevel][currentSublevel]);
    		_CurrentComponent.set(levels[currentLevel][currentSublevel].template);
    		setTimeout(() => {$$invalidate('mainVis', mainVis=true);}, 40);
    	}
    	// document.onload = () => {
    	// 	document.documentElement.requestFullscreen();
    	// }
    	// function GoInFullscreen(element) {
    	// 	if(element.requestFullscreen)
    	// 		element.requestFullscreen();
    	// 	else if(element.mozRequestFullScreen)
    	// 		element.mozRequestFullScreen();
    	// 	else if(element.webkitRequestFullscreen)
    	// 		element.webkitRequestFullscreen();
    	// 	else if(element.msRequestFullscreen)
    	// 		element.msRequestFullscreen();
    	// }

    	const writable_props = ['name', 'CurrentScreen', 'CurrentComponent'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		return decrementStage();
    	}

    	function click_handler_1() {
    		return incrementStage();
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('CurrentScreen' in $$props) $$invalidate('CurrentScreen', CurrentScreen = $$props.CurrentScreen);
    		if ('CurrentComponent' in $$props) $$invalidate('CurrentComponent', CurrentComponent = $$props.CurrentComponent);
    	};

    	return {
    		name,
    		mainVis,
    		CurrentScreen,
    		CurrentComponent,
    		incrementStage,
    		decrementStage,
    		click_handler,
    		click_handler_1
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["name", "CurrentScreen", "CurrentComponent"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    		if (ctx.CurrentScreen === undefined && !('CurrentScreen' in props)) {
    			console.warn("<App> was created without expected prop 'CurrentScreen'");
    		}
    		if (ctx.CurrentComponent === undefined && !('CurrentComponent' in props)) {
    			console.warn("<App> was created without expected prop 'CurrentComponent'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get CurrentScreen() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set CurrentScreen(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get CurrentComponent() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set CurrentComponent(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
