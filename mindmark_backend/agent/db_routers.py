# agent/db_router.py

class MemoryRouter:
    """
    Routes all operations on models labeled with `app_label = 'memory'` 
    to the 'memory' SQLite database. Used for long-term memory in agents.
    """

    route_app_labels = {'memory'}  # Target only models explicitly labeled

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'memory'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'memory'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        if (
            obj1._meta.app_label in self.route_app_labels or
            obj2._meta.app_label in self.route_app_labels
        ):
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.route_app_labels:
            return db == 'memory'
        return db == 'default'
