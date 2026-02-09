export const getPagination = (query) => {
  const limit = query.limit ? parseInt(query.limit) : 50;
  const offset = query.offset ? parseInt(query.offset) : 0;
  return { limit, offset };
};

export const serializePagination = (data, limit, offset) => {
    return {
        items: data.rows,
        total: data.count,
        limit,
        offset
    };
};

export const paginate = async (model, { page = 1, limit = 50 }, options = {}) => {
    const limitVal = parseInt(limit, 10) || 50;
    const pageVal = parseInt(page, 10) || 1;
    const offset = (pageVal - 1) * limitVal;

    const { count, rows } = await model.findAndCountAll({
        ...options,
        limit: limitVal,
        offset,
        distinct: true
    });

    return {
        data: rows,
        meta: {
            totalItems: count,
            totalPages: Math.ceil(count / limitVal),
            current: pageVal,
            perPage: limitVal
        }
    };
};
