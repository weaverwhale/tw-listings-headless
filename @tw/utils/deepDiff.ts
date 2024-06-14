import _ from 'lodash';

export function deepDiff(fromObject: any, toObject: any, specificPaths?: string[]) {
  const changes = {};
  const buildPath = (path, __, key) => (_.isUndefined(path) ? key : `${path}.${key}`);

  let obj1 = {};
  let obj2 = {};
  if (_.isArray(specificPaths) && !_.isEmpty(specificPaths)) {
    for (const path of specificPaths) {
      if (_.has(fromObject, path)) {
        _.set(obj1, path, _.get(fromObject, path));
      } else if (_.has(toObject, path)) {
        changes[path] = { to: _.get(toObject, path) };
      }
      if (_.has(toObject, path)) {
        _.set(obj2, path, _.get(toObject, path));
      } else if (_.has(fromObject, path)) {
        changes[path] = { from: _.get(fromObject, path) };
      }
    }
  } else {
    obj1 = fromObject;
    obj2 = toObject;
  }

  const walk = (fromObject, toObject, path?) => {
    for (const key of _.keys(fromObject)) {
      const currentPath = buildPath(path, fromObject, key);
      if (!_.has(toObject, key)) {
        changes[currentPath] = { from: _.get(fromObject, key) };
      }
    }

    for (const [key, to] of _.entries(toObject)) {
      const currentPath = buildPath(path, toObject, key);
      if (!_.has(fromObject, key)) {
        changes[currentPath] = { to };
      } else {
        const from = _.get(fromObject, key);
        if (!_.isEqual(from, to)) {
          if (_.isObjectLike(to) && _.isObjectLike(from)) {
            walk(from, to, currentPath);
          } else {
            changes[currentPath] = { from, to };
          }
        }
      }
    }
  };

  walk(obj1, obj2);

  return changes;
}
