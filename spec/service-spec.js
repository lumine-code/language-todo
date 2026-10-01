describe("TODO injection service", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-todo");
  });

  it("returns one disposable that owns every registered node type", () => {
    const registrations = [];
    spyOn(lumine.grammars, "addInjectionPoint").and.callFake(() => {
      const registration = { dispose: jasmine.createSpy("dispose") };
      registrations.push(registration);
      return registration;
    });

    const service = lumine.packages
      .getActivePackage("language-todo")
      .mainModule.provideTodoInjection();
    const disposable = service.addInjectionPoint("source.test", {
      types: ["comment", "string"],
    });

    expect(registrations.length).toBe(2);
    disposable.dispose();
    expect(registrations[0].dispose).toHaveBeenCalled();
    expect(registrations[1].dispose).toHaveBeenCalled();
  });

  it("preserves bounded annotation eligibility and explicit JavaScript overrides", () => {
    const points = [];
    spyOn(lumine.grammars, "addInjectionPoint").and.callFake((_scope, point) => {
      points.push(point);
      return { dispose() {} };
    });
    const service = lumine.packages
      .getActivePackage("language-todo")
      .mainModule.provideTodoInjection();
    const ordinary = { text: "an ordinary comment" };
    for (const text of ["TODO: finish", "NOTE: example", "WARNING: check"]) {
      expect(service.test({ text })).toBe(true);
      expect(service.test({ text })).toBe(true);
    }
    for (const text of [ordinary.text, "todo: lowercase", "TODOS are prose", "NOTED"])
      expect(service.test({ text })).toBe(false);

    service.addInjectionPoint("source.test", { types: "comment" });
    service.addInjectionPoint("source.test", { types: "comment", language: () => "todo" });
    service.addInjectionPoint("source.test", { types: "comment", language: () => null });
    expect(points[0].language(ordinary)).toBeUndefined();
    expect(points[1].language(ordinary)).toBe("todo");
    expect(points[2].language({ text: "TODO" })).toBeNull();
  });
});
