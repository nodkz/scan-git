import assert from 'assert';
import { fixtures, nullRepo } from './helpers/fixture.js';
import { validRefs } from './fixtures/valid-refs.js';
import { invalidRefs } from './fixtures/invalid-refs.js';
import {
    ambiguousRefsTag,
    ambiguousRefsBranch,
    ambiguousRefsRemoteBranch
} from './fixtures/ambiguous-refs.js';

describe('resolve-ref', () => {
    let repo = nullRepo;
    before(async () => (repo = await fixtures.base.repo()));
    after(() => repo?.dispose().then(() => (repo = nullRepo)));

    describe('defaultBranch()', () => {
        const defaultBranches = {
            base: 'main',
            detached: 'main',
            cruft: 'main',
            'no-remotes': 'main',
            upstream: 'fork-main',
            clean: 'empty-branch' // FIXME
        };

        for (const [repoName, expected] of Object.entries(defaultBranches)) {
            (repoName === 'clean' ? it.skip : it)(repoName, async () => {
                const repo = await fixtures[repoName].repo();
                const actual = await repo.defaultBranch();

                assert.strictEqual(actual, expected);

                return repo.dispose();
            });
        }
    });

    describe('currentBranch()', () => {
        const defaultBranches = {
            base: { name: 'test', oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6' },
            detached: { name: null, oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6' },
            cruft: { name: 'main', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
            'no-remotes': { name: 'main', oid: '293e1ffaf7158c249fc654aec07eca555a25de09' },
            upstream: { name: 'fork-main', oid: '293e1ffaf7158c249fc654aec07eca555a25de09' },
            clean: { name: 'empty-branch', oid: null } // FIXME
        };

        for (const [repoName, expected] of Object.entries(defaultBranches)) {
            (repoName === 'clean' ? it.skip : it)(repoName, async () => {
                const repo = await fixtures[repoName].repo();
                const actual = await repo.currentBranch();

                assert.deepStrictEqual(actual, expected);

                return repo.dispose();
            });
        }
    });

    describe('listBranches()', () => {
        it('local branches', async () => {
            const actual = await repo.listBranches();
            const expected = [
                'loose-and-packed',
                'main',
                'onmain-branch',
                'packed',
                'should-be-head',
                'should-be-tag',
                'test',
                'with-slash/should-be-head',
                'with-slash/should-be-tag'
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('local branches with oids', async () => {
            const actual = await repo.listBranches(true);
            const expected = [
                { name: 'loose-and-packed', oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6' },
                { name: 'main', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                { name: 'onmain-branch', oid: '7c2a62cdbc2ef28afaaed3b6f3aef9b581e5aa8e' },
                {
                    name: 'packed',
                    oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
                },
                { name: 'should-be-head', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                {
                    name: 'should-be-tag',
                    oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
                },
                { name: 'test', oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6' },
                {
                    name: 'with-slash/should-be-head',
                    oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
                },
                {
                    name: 'with-slash/should-be-tag',
                    oid: '7c2a62cdbc2ef28afaaed3b6f3aef9b581e5aa8e'
                }
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('listRemoteBranches()', () => {
        it('remote branches', async () => {
            const actual = await repo.listRemoteBranches('origin');
            const expected = [
                'HEAD',
                'main',
                'packed',
                'should-be-head',
                'should-be-remote-head',
                'should-be-tag',
                'with-slash/should-be-remote-head',
                'with-slash/should-be-tag'
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('remote branches with oids', async () => {
            const actual = await repo.listRemoteBranches('origin', true);
            const expected = [
                { name: 'HEAD', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                { name: 'main', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                {
                    name: 'packed',
                    oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
                },
                { name: 'should-be-head', oid: '7c2a62cdbc2ef28afaaed3b6f3aef9b581e5aa8e' },
                { name: 'should-be-remote-head', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                {
                    name: 'should-be-tag',
                    oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
                },
                {
                    name: 'with-slash/should-be-remote-head',
                    oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
                },
                {
                    name: 'with-slash/should-be-tag',
                    oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
                }
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('listTags()', () => {
        it('tags', async () => {
            const actual = await repo.listTags();
            const expected = [
                'onmain-tag',
                'should-be-tag',
                'test-annotated-tag',
                'test-annotated-tag/packed',
                'test-tag',
                'with-slash/should-be-tag'
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('tags with oids', async () => {
            const actual = await repo.listTags(true);
            const expected = [
                { name: 'onmain-tag', oid: '7c2a62cdbc2ef28afaaed3b6f3aef9b581e5aa8e' },
                { name: 'should-be-tag', oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2' },
                { name: 'test-annotated-tag', oid: '56ea7a808e35df13e76fee92725a65a373a9835c' },
                {
                    name: 'test-annotated-tag/packed',
                    oid: '56ea7a808e35df13e76fee92725a65a373a9835c'
                },
                { name: 'test-tag', oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6' },
                {
                    name: 'with-slash/should-be-tag',
                    oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
                }
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('listRemotes()', () => {
        it('remotes', async () => {
            const actual = await repo.listRemotes();
            const expected = ['origin', 'with-slash'];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('resolveRef()', () => {
        it('oid into oid', async () => {
            const oid = '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2';
            const actual = await repo.resolveRef(oid);

            assert.strictEqual(actual, oid);
        });

        it('should use loose on resolve when a ref stored as loose and packed', async () => {
            const actual = await repo.resolveRef('loose-and-packed');

            assert.strictEqual(actual, '2dbee47a8d4f8d39e1168fad951b703ee05614d6');
        });

        describe('ref into oid', () => {
            for (const { refs, oid: expected } of validRefs) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.resolveRef(ref);

                        assert.strictEqual(actual, expected);
                    });
                }
            }
        });

        describe('throws not found error with wrong refs', () => {
            for (const { refs } of invalidRefs) {
                for (const ref of refs) {
                    it(ref, async () => {
                        await assert.rejects(
                            () => repo.resolveRef(ref),
                            /Reference "\S+" is not found/
                        );
                    });
                }
            }
        });
    });

    describe('expandRef()', () => {
        it('oid into oid', async () => {
            const oid = '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2';
            const actual = await repo.expandRef(oid);

            assert.strictEqual(actual, oid);
        });

        describe('returns null for invalid refs', () => {
            for (const { refs } of invalidRefs) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.expandRef(ref);

                        assert.strictEqual(actual, null);
                    });
                }
            }
        });

        describe('should expand valid refs into a full path', () => {
            for (const { refs, expandsTo: expected } of validRefs) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.expandRef(ref);

                        assert.strictEqual(actual, expected);
                    });
                }
            }
        });

        describe('should expand an ambiguous ref into tag full path first', () => {
            for (const { refs, expandsTo: expected } of ambiguousRefsTag) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.expandRef(ref);

                        assert.strictEqual(actual, expected);
                    });
                }
            }
        });

        describe('should expand an ambiguous ref into branch full path if no tag exists', () => {
            for (const { refs, expandsTo: expected } of ambiguousRefsBranch) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.expandRef(ref);

                        assert.strictEqual(actual, expected);
                    });
                }
            }
        });

        describe('should expand an ambiguous ref into branch full path if no tag or local branch exist', () => {
            for (const { refs, expandsTo: expected } of ambiguousRefsRemoteBranch) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.expandRef(ref);

                        assert.strictEqual(actual, expected);
                    });
                }
            }
        });
    });

    describe('isRefExists()', () => {
        describe('returns true for valid refs', () => {
            for (const { refs } of validRefs) {
                for (const ref of refs) {
                    it(ref, async () => {
                        const actual = await repo.isRefExists(ref);

                        assert.strictEqual(actual, true);
                    });
                }
            }
        });

        it('returns false for non-existing refs', async () => {
            const actual = await repo.isRefExists('refs/heads/mainnn');

            assert.strictEqual(actual, false);
        });
    });

    describe('describeRef()', () => {
        it('non-exists reference', () =>
            assert.rejects(
                () => repo.describeRef('non-exists'),
                /Reference "non-exists" is not found/
            ));

        it('symbolic', async () => {
            const actual = await repo.describeRef('HEAD');

            assert.deepStrictEqual(actual, {
                path: 'HEAD',
                name: 'HEAD',
                symbolic: true,
                scope: 'refs/heads',
                namespace: 'refs',
                category: 'heads',
                remote: null,
                ref: 'refs/heads/test',
                oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
            });
        });

        it('remotes symbolic', async () => {
            const actual = await repo.describeRef('origin/HEAD');

            assert.deepStrictEqual(actual, {
                path: 'refs/remotes/origin/HEAD',
                name: 'HEAD',
                symbolic: true,
                scope: 'refs/remotes',
                namespace: 'refs',
                category: 'remotes',
                remote: 'origin',
                ref: 'refs/remotes/origin/main',
                oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
            });
        });

        it('branch ref', async () => {
            const actual = await repo.describeRef('main');

            assert.deepStrictEqual(actual, {
                path: 'refs/heads/main',
                name: 'main',
                symbolic: false,
                scope: 'refs/heads',
                namespace: 'refs',
                category: 'heads',
                remote: null,
                ref: null,
                oid: '7b84f676f2fbea2a3c6d83924fa63059c7bdfbe2'
            });
        });

        it('tag ref', async () => {
            const actual = await repo.describeRef('refs/tags/test-tag');

            assert.deepStrictEqual(actual, {
                path: 'refs/tags/test-tag',
                name: 'test-tag',
                symbolic: false,
                scope: 'refs/tags',
                namespace: 'refs',
                category: 'tags',
                remote: null,
                ref: null,
                oid: '2dbee47a8d4f8d39e1168fad951b703ee05614d6'
            });
        });
    });

    describe('isOid()', () => {
        it('should return true for a valid OID (40-character hexadecimal string)', function () {
            assert.strictEqual(repo.isOid('1234567890abcdef1234567890abcdef12345678'), true);
        });

        const badValues = [
            '1234567890abcdef1234567890abcdef1234',
            '1234567890abcdef1234567890abcdef12345678901234',
            '1234567890abcdef1234567890abcdef1234567G',
            1234567895678901,
            ''
        ];

        for (const value of badValues) {
            it(JSON.stringify(value), () => {
                assert.strictEqual(repo.isOid('1234567890abcdef1234567890abcdef1234567G'), false);
            });
        }
    });
});
