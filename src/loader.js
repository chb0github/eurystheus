import loader from 'require-all'
import p from 'path'

export default function (path, suffix, resolver)  {
    var suf = suffix || '';
    return loader({
        dirname: path,
        filter: `.*${suf}\.js`,
        resolve: resolver,
        map: (name, path)  => {
            var filename = p.basename(path, '.js');
            var match = filename.match(`(.*)${suf}`);
            return match[1] || match[0];
        }
    });
};
