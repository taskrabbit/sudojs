 # Sudo Micro Templating

 This implementaion piggyback's on J.Resig's initial micro templating post
 right along with all the others (Underscore etc...)

## Usage

An example reusable template:

		var tmpl = '<ul> \
			{{ for (var i = 0; i < knights.length; i++) { }} \
				{{ var knight = knights[i]; }} \
				<li> \
					<em>{{= knight.name }}</em>. favorite color: {{= knight.favoriteColor }} \
				</li> \
			{{ } }} \
		</ul>';

As opposed to others, sudo micro templating requires that you use a `scope`
object with your template (thus avoiding the use of `with`), this is reflected in the fact that the above for loop
iterates over `knights.length`. This mechanism is achieved by passing
at least 2 `arguments` to the `_.template` method. For example, to retain a `compiled` version of your template
function you would do this (note the second arg):

		var compiled = _.template(tmpl, 'knights');

This returns a function that can be called multiple times with data structures looking like this:

		var data = [{
			"name": "Lancelot",
			"favoriteColor": "blue"
		}, {
			"name": "Galahad",
			"favoriteColor": "unsure"
		}];

This Array will then be available in to the template as `knights` (your scope arg) when passed in 
to the `compiled` function:

		compiled(data);

### The Source

Can be useful:

		compiled.source
